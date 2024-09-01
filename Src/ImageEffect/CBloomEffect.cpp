#include "CBloomEffect.h"
#include <Graphics/CFrameRenderer.h>

// 縮小バッファBloomの実装方法
// https://chatgpt.com/c/a491f927-d30f-4f9d-a416-934e61e7152f

namespace imageeffect
{
	CBloomEffect::CBloomEffect():
		m_BrightFrameRenderer(nullptr),
		m_BloomMixPassRenderer(nullptr)
	{
	}

	CBloomEffect::~CBloomEffect()
	{
	}

	bool CBloomEffect::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		// ブルーム用
		if (!pGraphicsAPI->CreateRenderPass("BrigtnessPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 2)) return false;
		
		if (!pGraphicsAPI->CreateRenderPass("ReducePass_2x2", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / 2, 1024 / 2, 1)) return false;
		if (!pGraphicsAPI->CreateRenderPass("ReducePass_2x2_XBlur", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / 2, 1024 / 2, 1)) return false;
		if (!pGraphicsAPI->CreateRenderPass("ReducePass_2x2_XBlur", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / 2, 1024 / 2, 1)) return false;
		
		if (!pGraphicsAPI->CreateRenderPass("ReducePass_4x4", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / 4, 1024 / 4, 1)) return false;
		
		if (!pGraphicsAPI->CreateRenderPass("ReducePass_8x8", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), 1024 / 8, 1024 / 8, 1)) return false;
		
		if (!pGraphicsAPI->CreateRenderPass("BloomMixPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		//
		m_BrightFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "BrigtnessPass", pGraphicsAPI->FindOffScreenRenderPass("MainResultPass")->GetFrameTextureList());
		if (!m_BrightFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\Brigtness_MF.json")) return false;
		
		//
		{
			std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("BrigtnessPass")->GetFrameTexture(1));

			std::shared_ptr<graphics::CFrameRenderer> ReduceFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "ReducePass_2x2", TextureList);
			if (!ReduceFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\ReduceBuffer_MF.json")) return false;

			m_ReduceFrameRendererList.push_back(std::make_tuple(ReduceFrameRenderer, nullptr, nullptr));
		}

		//
		m_BloomMixPassRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "BrigtnessPass", pGraphicsAPI->FindOffScreenRenderPass("MainResultPass")->GetFrameTextureList());
		if (!m_BloomMixPassRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\Brigtness_MF.json")) return false;

		return true;
	}

	bool CBloomEffect::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera,
		const std::shared_ptr<projection::CProjection>& Projection, const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_BrightFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		
		/*for (auto& RendererTuple : m_ReduceFrameRendererList)
		{
			auto&
		}*/
		if (!std::get<0>(m_ReduceFrameRendererList[0])->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

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
				Material->SetUniformValue("Threshold", &glm::vec1(1.0f)[0], sizeof(float));
			}
			if (!m_BrightFrameRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// ReducePass_2x2
		{
			// ReducePass_2x2
			if (!pGraphicsAPI->BeginRender("ReducePass_2x2")) return false;
			if (!std::get<0>(m_ReduceFrameRendererList[0])->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// ReducePass_4x4
		{

		}

		// ReducePass_8x8
		{

		}

		// BloomMixPass(MainResultPass)
		/*{
			if (!pGraphicsAPI->BeginRender("MainResultPass")) return false;
			if (!m_BloomMixPassRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}*/

		return true;
	}
}