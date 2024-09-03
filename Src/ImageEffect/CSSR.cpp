#include "CSSR.h"
#include <Graphics/CFrameRenderer.h>
#include <Message/Console.h>

namespace imageeffect
{
	CSSR::CSSR(const std::string& TargetPassName):
		m_TargetPassName(TargetPassName),
		m_SSRFrameRenderer(nullptr),
		m_ResultRenderer(nullptr)
	{
	}

	CSSR::~CSSR()
	{
	}

	bool CSSR::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker, const std::tuple<std::string, int>& DepthGBufferTuple,
		const std::tuple<std::string, int>& PosGBufferTuple, const std::tuple<std::string, int>& NormalGBufferTuple, const std::tuple<std::string, int>& MetallicRoughnessGBufferTuple)
	{
		// オフスクリーンレンダーパス
		if (!pGraphicsAPI->CreateRenderPass("SSRPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(m_TargetPassName)->GetFrameTexture());
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(std::get<0>(DepthGBufferTuple))->GetFrameTexture(std::get<1>(DepthGBufferTuple)));
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(std::get<0>(PosGBufferTuple))->GetFrameTexture(std::get<1>(PosGBufferTuple)));
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(std::get<0>(NormalGBufferTuple))->GetFrameTexture(std::get<1>(NormalGBufferTuple)));
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(std::get<0>(MetallicRoughnessGBufferTuple))->GetFrameTexture(std::get<1>(MetallicRoughnessGBufferTuple)));

		m_SSRFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "SSRPass", TextureList);
		if (!m_SSRFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\SSR_MF.json")) return false;

		m_ResultRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, m_TargetPassName, pGraphicsAPI->FindOffScreenRenderPass("SSRPass")->GetFrameTextureList());
		if (!m_ResultRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;

		return true;

		return true;
	}

	bool CSSR::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_SSRFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		if (!m_ResultRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

		return true;
	}

	bool CSSR::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		// SSRPass
		{
			if (!pGraphicsAPI->BeginRender("SSRPass")) return false;
			if (!m_SSRFrameRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}
		
		// ResultPass
		{
			if (!pGraphicsAPI->BeginRender(m_TargetPassName)) return false;
			if (!m_ResultRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}
}