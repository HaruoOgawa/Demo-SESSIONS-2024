#include "CBloomEffect.h"
#include <Graphics/CFrameRenderer.h>
#include <Message/Console.h>

// 縮小バッファBloomの実装方法
// https://chatgpt.com/c/a491f927-d30f-4f9d-a416-934e61e7152f

namespace imageeffect
{
	CBloomEffect::CBloomEffect(const std::string& TargetPassName):
		CValueRegistry("BloomRegistry"),
		m_TargetPassName(TargetPassName),
		m_BrightFrameRenderer(nullptr),
		m_BloomMixPassRenderer(nullptr)
	{
		m_ReduceBufList = {
			std::make_tuple(SReduceBuf{"ReducePass_2x2", "BrigtnessPass"}, SReduceBuf{"ReducePass_2x2_XBlur", "ReducePass_2x2"} ,SReduceBuf{"ReducePass_2x2_YBlur", "ReducePass_2x2_XBlur"}),
			std::make_tuple(SReduceBuf{"ReducePass_4x4", "ReducePass_2x2_YBlur"}, SReduceBuf{"ReducePass_4x4_XBlur", "ReducePass_4x4"} ,SReduceBuf{"ReducePass_4x4_YBlur", "ReducePass_4x4_XBlur"}),
			std::make_tuple(SReduceBuf{"ReducePass_8x8", "ReducePass_4x4_YBlur"}, SReduceBuf{"ReducePass_8x8_XBlur", "ReducePass_8x8"} ,SReduceBuf{"ReducePass_8x8_YBlur", "ReducePass_8x8_XBlur"})
		};

		// プロパティの設定
		SetValue("Threshold", graphics::EUniformValueType::VALUE_TYPE_FLOAT, &glm::vec1(1.0f)[0], sizeof(float));
		SetValue("Intencity", graphics::EUniformValueType::VALUE_TYPE_FLOAT, &glm::vec1(1.5f)[0], sizeof(float));
	}

	CBloomEffect::~CBloomEffect()
	{
	}

	bool CBloomEffect::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		// オフスクリーンレンダーパス
		if (!pGraphicsAPI->CreateRenderPass("BrigtnessPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 2)) return false;
		
		for (int i = 0; i < static_cast<int>(m_ReduceBufList.size()); i++)
		{
			const auto& ReduceBuf = m_ReduceBufList[i];

			int Rate = static_cast<int>(powf(2.0f, float(i) + 1.0f));

			if (!pGraphicsAPI->CreateRenderPass(std::get<0>(ReduceBuf).DstPass, api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / Rate, 1024 / Rate, 1)) return false;
			if (!pGraphicsAPI->CreateRenderPass(std::get<1>(ReduceBuf).DstPass, api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / Rate, 1024 / Rate, 1)) return false;
			if (!pGraphicsAPI->CreateRenderPass(std::get<2>(ReduceBuf).DstPass, api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / Rate, 1024 / Rate, 1)) return false;
		}

		// FrameBufferRenderer
		// BrigtnessPass
		m_BrightFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "BrigtnessPass", pGraphicsAPI->FindOffScreenRenderPass(m_TargetPassName)->GetFrameTextureList());
		if (!m_BrightFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\Brigtness_MF.json")) return false;
		
		for (int i = 0; i < static_cast<int>(m_ReduceBufList.size()); i++)
		{
			const auto& ReduceBufTuple = m_ReduceBufList[i];

			// ReducePass
			std::shared_ptr<graphics::CFrameRenderer> ReduceFrameRenderer = nullptr;
			{
				const auto& ReduceBuf = std::get<0>(ReduceBufTuple);

				std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
				TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(ReduceBuf.SrcPass)->GetFrameTexture());

				ReduceFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, ReduceBuf.DstPass, TextureList);
				if (!ReduceFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\ReduceBuffer_MF.json")) return false;
			}

			// ReducePass_XBlur
			std::shared_ptr<graphics::CFrameRenderer> XBlurFrameRenderer = nullptr;
			{
				const auto& ReduceBuf = std::get<1>(ReduceBufTuple);

				std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
				TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(ReduceBuf.SrcPass)->GetFrameTexture());

				XBlurFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, ReduceBuf.DstPass, TextureList);
				if (!XBlurFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\Blur1Pass_MF.json")) return false;
			}

			// ReducePass_YBlur
			std::shared_ptr<graphics::CFrameRenderer> YBlurFrameRenderer = nullptr;
			{
				const auto& ReduceBuf = std::get<2>(ReduceBufTuple);

				std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
				TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(ReduceBuf.SrcPass)->GetFrameTexture());

				YBlurFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, ReduceBuf.DstPass, TextureList);
				if (!YBlurFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\Blur1Pass_MF.json")) return false;
			}

			m_ReduceFrameRendererList.push_back(std::make_tuple(ReduceFrameRenderer, XBlurFrameRenderer, YBlurFrameRenderer));
		}

		// 数が違ったらエラー
		if (m_ReduceBufList.size() != m_ReduceFrameRendererList.size())
		{
			Console::Log("[Error] ReduceBufList.size and ReduceFrameRendererList is not same.\n");
			return false;
		}

		//
		{
			std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("BrigtnessPass")->GetFrameTexture(1));
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("ReducePass_8x8_YBlur")->GetFrameTexture());

			m_BloomMixPassRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, m_TargetPassName, TextureList);
			if (!m_BloomMixPassRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\BloomMix_MF.json")) return false;
		}

		return true;
	}

	bool CBloomEffect::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera,
		const std::shared_ptr<projection::CProjection>& Projection, const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_BrightFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		
		for (auto& RendererTuple : m_ReduceFrameRendererList)
		{
			if (!std::get<0>(RendererTuple)->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
			if (!std::get<1>(RendererTuple)->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
			if (!std::get<2>(RendererTuple)->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		}

		if (!m_BloomMixPassRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

		return true;
	}

	bool CBloomEffect::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		// BrigtnessPass
		{
			if (!pGraphicsAPI->BeginRender("BrigtnessPass")) return false;
			const auto& Material = m_BrightFrameRenderer->GetMaterial();
			if (Material)
			{
				const auto Threshold = GetValue("Threshold");
				const auto Intencity = GetValue("Intencity");

				Material->SetUniformValue("Threshold", &Threshold.Buffer[0], Threshold.ByteSize);
				Material->SetUniformValue("Intencity", &Intencity.Buffer[0], Intencity.ByteSize);
			}
			if (!m_BrightFrameRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		for (int i = 0; i < static_cast<int>(m_ReduceBufList.size()); i++)
		{
			const auto& ReduceBufTuple = m_ReduceBufList[i];
			const auto& ReduceFrameRendererTuple = m_ReduceFrameRendererList[i];

			// ReducePass
			const auto& FrameRenderer_0 = std::get<0>(ReduceFrameRendererTuple);
			if (FrameRenderer_0)
			{
				const auto& ReduceBuf = std::get<0>(ReduceBufTuple);

				if (!pGraphicsAPI->BeginRender(ReduceBuf.DstPass)) return false;
				if (!FrameRenderer_0->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
				if (!pGraphicsAPI->EndRender()) return false;
			}

			// ReducePass_XBlur
			const auto& FrameRenderer_1 = std::get<1>(ReduceFrameRendererTuple);
			if (FrameRenderer_1)
			{
				const auto& ReduceBuf = std::get<1>(ReduceBufTuple);

				if (!pGraphicsAPI->BeginRender(ReduceBuf.DstPass)) return false;
				const auto& Material = FrameRenderer_1->GetMaterial();
				if (Material)
				{
					Material->SetUniformValue("IsXBlur", &glm::ivec1(1)[0], sizeof(int));
				}
				if (!FrameRenderer_1->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
				if (!pGraphicsAPI->EndRender()) return false;
			}

			// ReducePass_YBlur
			const auto& FrameRenderer_2 = std::get<2>(ReduceFrameRendererTuple);
			if (FrameRenderer_2)
			{
				const auto& ReduceBuf = std::get<2>(ReduceBufTuple);

				if (!pGraphicsAPI->BeginRender(ReduceBuf.DstPass)) return false;
				const auto& Material = FrameRenderer_2->GetMaterial();
				if (Material)
				{
					Material->SetUniformValue("IsXBlur", &glm::ivec1(0)[0], sizeof(int));
				}
				if (!FrameRenderer_2->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
				if (!pGraphicsAPI->EndRender()) return false;
			}
		}

		// BloomMixPass
		{
			if (!pGraphicsAPI->BeginRender(m_TargetPassName)) return false;
			if (!m_BloomMixPassRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}
}