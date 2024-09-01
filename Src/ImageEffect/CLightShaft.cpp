#include "CLightShaft.h"
#include <Graphics/CFrameRenderer.h>
#include <Message/Console.h>

namespace imageeffect
{
	CLightShaft::CLightShaft(const std::string& TargetPassName, const std::tuple<std::string, int>& DepthBufferTuple):
		m_TargetPassName(TargetPassName),
		m_DepthBufferTuple(DepthBufferTuple),
		m_LightShaftFrameRenderer(nullptr),
		m_ResultRenderer(nullptr)
	{
	}

	CLightShaft::~CLightShaft()
	{
	}

	bool CLightShaft::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		// オフスクリーンレンダーパス
		if (!pGraphicsAPI->CreateRenderPass("LightShaftPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		std::vector<std::shared_ptr<graphics::CTexture>> TextureList;
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(m_TargetPassName)->GetFrameTexture());
		TextureList.push_back(pGraphicsAPI->FindOffScreenRenderPass(std::get<0>(m_DepthBufferTuple))->GetFrameTexture(std::get<1>(m_DepthBufferTuple)));

		m_LightShaftFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "LightShaftPass", TextureList);
		if (!m_LightShaftFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\LightShaft_MF.json")) return false;

		m_ResultRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, m_TargetPassName, pGraphicsAPI->FindOffScreenRenderPass("LightShaftPass")->GetFrameTextureList());
		if (!m_ResultRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;

		return true;
	}

	bool CLightShaft::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_LightShaftFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		if (!m_ResultRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

		return true;
	}

	bool CLightShaft::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		// LightShaftPass
		{
			if (!pGraphicsAPI->BeginRender("LightShaftPass")) return false;
			const auto& Material = m_LightShaftFrameRenderer->GetMaterial();
			if (Material)
			{
				//Material->SetUniformValue("Threshold", &glm::vec1(1.0f)[0], sizeof(float));
				//Material->SetUniformValue("Intencity", &glm::vec1(1.5f)[0], sizeof(float));
			}
			if (!m_LightShaftFrameRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// Draw Result
		{
			if (!pGraphicsAPI->BeginRender(m_TargetPassName)) return false;
			if (!m_ResultRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}
}