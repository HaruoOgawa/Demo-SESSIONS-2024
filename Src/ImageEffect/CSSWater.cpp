#include "CSSWater.h"

// Screen Space Water

#include <Graphics/CFrameRenderer.h>
#include <Scene/CSceneController.h>
#include <Message/Console.h>

namespace imageeffect
{
	CSSWater::CSSWater(const std::string& TargetPassName) :
		m_TargetPassName(TargetPassName),
		m_SSWaterMixRenderer(nullptr),
		m_MRTBlitRenderer(nullptr),
		m_ResultRenderer(nullptr)
	{
	}

	CSSWater::~CSSWater()
	{
	}

	bool CSSWater::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker, const std::tuple<std::string, int>& DepthGBufferTuple,
		const std::tuple<std::string, int>& PosGBufferTuple, const std::tuple<std::string, int>& NormalGBufferTuple, const std::tuple<std::string, int>& MetallicRoughnessGBufferTuple)
	{
		// オフスクリーンレンダーパス
		if (!pGraphicsAPI->CreateRenderPass("SSWaterMRTPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(1.0f, 1.0f, 1.0f, 1.0f), -1, -1, 5)) return false;
		if (!pGraphicsAPI->CreateRenderPass("SSWaterMixPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 6)) return false;

		{
			std::vector<std::shared_ptr<graphics::CTexture>> TextureList;

			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTexture(0)); // GPosition
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTexture(1)); // GNormal
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTexture(2)); // GAlbedo
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTexture(3)); // GDepth
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTexture(4)); // GParam1

			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMRTPass")->GetFrameTexture(0)); // GPosition
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMRTPass")->GetFrameTexture(1)); // GNormal
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMRTPass")->GetFrameTexture(2)); // GAlbedo
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMRTPass")->GetFrameTexture(3)); // GDepth
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMRTPass")->GetFrameTexture(4)); // GParam1

			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(m_TargetPassName)->GetFrameTexture()); // MainResultColor

			m_SSWaterMixRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "SSWaterMixPass", TextureList);
			if (!m_SSWaterMixRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\SSWaterMix_MF.json")) return false;
		}

		{
			std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
			
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(1)); // GPosition
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(2)); // GNormal
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(3)); // GAlbedo
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(4)); // GDepth
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(5)); // GParam1

			m_MRTBlitRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "MRTPass", TextureList);
			if (!m_MRTBlitRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\MRTBlit_MF.json")) return false;
		}

		{
			std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
			TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass("SSWaterMixPass")->GetFrameTexture(0)); // MainResultColor

			m_ResultRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, m_TargetPassName, TextureList);
			if (!m_ResultRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;
		}

		return true;
	}

	bool CSSWater::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_SSWaterMixRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		if (!m_MRTBlitRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		if (!m_ResultRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

		return true;
	}

	bool CSSWater::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<scene::CSceneController>& SceneController)
	{
		// SSWaterMRTPass
		{
			if (!pGraphicsAPI->BeginRender("SSWaterMRTPass")) return false;
			if (!SceneController->Draw(pGraphicsAPI, false, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// SSWaterMixPass
		{
			if (!pGraphicsAPI->BeginRender("SSWaterMixPass")) return false;
			if (!m_SSWaterMixRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// SSWaterMixPassのGBuffer成分をMRTPassにコピー 
		{
			if (!pGraphicsAPI->BeginRender("MRTPass")) return false;
			if (!m_MRTBlitRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// SSWaterMixPassのメインカラー成分をResultPassに再描画
		{
			if (!pGraphicsAPI->BeginRender(m_TargetPassName)) return false;
			if (!m_ResultRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}
}