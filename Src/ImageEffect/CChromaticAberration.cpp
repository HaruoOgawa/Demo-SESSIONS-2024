#include "CChromaticAberration.h"
#include <Graphics/CFrameRenderer.h>
#include <Message/Console.h>

namespace imageeffect
{
	CChromaticAberration::CChromaticAberration(const std::string& TargetPassName) :
		CValueRegistry("ChromaticRegistry"),
		m_TargetPassName(TargetPassName),
		m_CAFrameRenderer(nullptr),
		m_ResultRenderer(nullptr)
	{
		// プロパティの設定
		SetValue("WhiteRate", graphics::EUniformValueType::VALUE_TYPE_FLOAT, &glm::vec1(0.0f)[0], sizeof(float));
	}

	CChromaticAberration::~CChromaticAberration()
	{
	}

	bool CChromaticAberration::Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		// オフスクリーンレンダーパス
		if (!pGraphicsAPI->CreateRenderPass("CAPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		m_CAFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "CAPass", pGraphicsAPI->FindOffScreenRenderPass(m_TargetPassName)->GetFrameTextureList());
		if (!m_CAFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\ChromaticAberration_MF.json")) return false;

		m_ResultRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, m_TargetPassName, pGraphicsAPI->FindOffScreenRenderPass("CAPass")->GetFrameTextureList());
		if (!m_ResultRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;

		return true;
	}

	bool CChromaticAberration::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_CAFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;
		if (!m_ResultRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, Camera, Projection, DrawInfo, InputState)) return false;

		return true;
	}

	bool CChromaticAberration::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		// CAPass
		{
			if (!pGraphicsAPI->BeginRender("CAPass")) return false;
			const auto& Material = m_CAFrameRenderer->GetMaterial();
			if (Material)
			{
				const auto WhiteRate = GetValue("WhiteRate");

				Material->SetUniformValue("whiteRate", &WhiteRate.Buffer[0], WhiteRate.ByteSize);
			}
			if (!m_CAFrameRenderer->Draw(pGraphicsAPI, Camera, Projection, DrawInfo)) return false;
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