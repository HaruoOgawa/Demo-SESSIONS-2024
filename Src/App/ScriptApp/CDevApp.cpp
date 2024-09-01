#ifdef _DEBUG

#include "CDevApp.h"
#include "../../LoadWorker/CLoadWorker.h"
#include "Scene/CScriptScene.h"
#include "../../Graphics/CDrawInfo.h"
#include "../../Camera/CCamera.h"
#include "../../Camera/CTraceCamera.h"
#include "../../Projection/CProjection.h"
#include "../../ImageEffect/CBlurEffect.h"
#include "../../Graphics/CFrameRenderer.h"
#include "../../Message/Console.h"
#include "../../Interface/IGUIEngine.h"
#ifdef USE_VIEWER_CAMERA
#include "../../Camera/CViewerCamera.h"
#endif // USE_VIEWER_CAMERA

#include "../../GUIApp/GUI/CGraphicsEditingWindow.h"
#include "../../GUIApp/Model/CFileModifier.h"
#include <Timeline/CTimelineController.h>
#include <Timeline/CNodeTrack.h>
#include <Timeline/CMaterialTrack.h>
#include <Scene/CSceneController.h>

// CDevApp は旧エンジンでもやっていたof風にCppでエンジンコードを直接シーンを構築していくアプリ

// MVVMで設計する
// App => ViewModel, Scene => View, API => Model
// Garnetで作品を作る時、View(Scene)とViewModel(App)は編集していいが、Modelの変更は一切許さない

// FrameBufferListはAppで作り、そのテクスチャリストをViewにInitializeの最後辺りで渡す

namespace app
{
	CDevApp::CDevApp() :
		m_SceneController(std::make_shared<scene::CSceneController>()),
		m_ScriptScene(nullptr),
		m_CameraSwitchToggle(true),
		m_MainCamera(nullptr),
#ifdef USE_VIEWER_CAMERA
		m_ViewCamera(std::make_shared<camera::CViewerCamera>()),
#else
		m_ViewCamera(std::make_shared<camera::CCamera>()),
#endif // USE_VIEWER_CAMERA
		m_TraceCamera(std::make_shared<camera::CTraceCamera>()),
		m_Projection(std::make_shared<projection::CProjection>()),
		m_DrawInfo(std::make_shared<graphics::CDrawInfo>()),
#ifdef USE_GUIENGINE
		m_GraphicsEditingWindow(std::make_shared<gui::CGraphicsEditingWindow>()),
#endif // USE_GUIENGINE
		m_BlurEffect(nullptr),
		m_DeferredRenderer(nullptr),
		m_MainFrameRenderer(nullptr),
		m_FileModifier(std::make_shared<CFileModifier>()),
		m_TimelineController(std::make_shared<timeline::CTimelineController>())
	{
		m_ViewCamera->SetPos(glm::vec3(-7.0f, 1.0f, 0.0f));
		m_MainCamera = m_ViewCamera;

		m_DrawInfo->GetLightCamera()->SetPos(glm::vec3(-2.358f, 15.6f, -0.59f));
		m_DrawInfo->GetLightProjection()->SetNear(2.0f);
		m_DrawInfo->GetLightProjection()->SetFar(100.0f);

		m_SceneController->SetDefaultPass("MainResultPass", "");
	}

	bool CDevApp::Release(api::IGraphicsAPI* pGraphicsAPI)
	{
		if (m_ScriptScene)
		{
			m_ScriptScene.reset();
			m_ScriptScene = nullptr;
		}

		if (m_BlurEffect)
		{
			m_BlurEffect.reset();
			m_BlurEffect = nullptr;
		}

		return true;
	}

	bool CDevApp::Initialize(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		pLoadWorker->AddScene(std::make_shared<resource::CSceneLoader>("Resources\\Scene\\MRTTest.json", m_SceneController));

		// Viewの初期化
		m_ScriptScene = std::make_shared<app::CScriptScene>(pGraphicsAPI, pLoadWorker, pPhysicsEngine);

		// オフスクリーンレンダリング
		//if (!pGraphicsAPI->CreateRenderPass("ShadowPass", api::ERenderPassFormat::COLOR_RENDERPASS, glm::vec4(1.0f), 512, 512)) return false;
		if (!pGraphicsAPI->CreateRenderPass("MRTTest", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 4)) return false;
		if (!pGraphicsAPI->CreateRenderPass("MainResultPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		m_BlurEffect = std::make_shared<imageeffect::CBlurEffect>(pGraphicsAPI);
		if (!m_BlurEffect->Create(pLoadWorker)) return false;

		m_DeferredRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "MainResultPass", pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTextureList());
		if (!m_DeferredRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\MRTSample_MF.json")) return false;

		m_MainFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "", pGraphicsAPI->FindOffScreenRenderPass("MainResultPass")->GetFrameTextureList());
		if (!m_MainFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;

		// FrameTextureを渡す
		//m_ScriptScene->SetFrameTexture(m_BlurEffect->GetFrameTexture());

		return true;
	}

	bool CDevApp::ProcessInput(api::IGraphicsAPI* pGraphicsAPI)
	{
		return true;
	}

	bool CDevApp::Resize(int Width, int Height)
	{
		m_Projection->SetScreenResolution(Width, Height);

		m_DrawInfo->GetLightProjection()->SetScreenResolution(Width, Height);

		return true;
	}

	bool CDevApp::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<input::CInputState>& InputState)
	{
		if (!m_FileModifier->Update(pLoadWorker)) return false;

		if (pLoadWorker->IsLoaded())
		{
			if (!m_TimelineController->Update(m_DrawInfo->GetDeltaSecondsTime(), InputState)) return false;
		}

		if (!m_SceneController->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_ScriptScene->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		if (!m_BlurEffect->Update(pLoadWorker)) return false;

		if (!m_DeferredRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		if (!m_MainFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		m_MainCamera->Update(m_DrawInfo->GetDeltaSecondsTime(), InputState);

		if (InputState->IsKeyUp(input::EKeyType::KEY_TYPE_SPACE))
		{
			m_CameraSwitchToggle = !m_CameraSwitchToggle;

			if (m_CameraSwitchToggle)
			{
				m_MainCamera = m_ViewCamera;
			}
			else
			{
				m_MainCamera = m_TraceCamera;
			}
		}

		return true;
	}

	bool CDevApp::LateUpdate(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		if (!m_SceneController->LateUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		if (!m_ScriptScene->LateUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		return true;
	}

	bool CDevApp::FixedUpdate(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		if (!m_SceneController->FixedUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		if (!m_ScriptScene->FixedUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		return true;
	}

	bool CDevApp::Draw(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		/*// Dispatch GPGPU
		if (!m_ScriptScene->Dispatch(pGraphicsAPI, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo)) return false;

		// ShadowPass
		if (!pGraphicsAPI->BeginRender("ShadowPass")) return false;
		if (!m_ScriptScene->Draw(pGraphicsAPI, true, m_MainCamera, m_Projection, m_DrawInfo)) return false;
		if (!pGraphicsAPI->EndRender()) return false;

		// ShadowMapにブラーをかける
		if (!m_BlurEffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;*/

		// MRTTest FrameBuffer
		{
			if (!pGraphicsAPI->BeginRender("MRTTest")) return false;
			if (!m_SceneController->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!m_ScriptScene->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// MainResultPass
		{
			if (!pGraphicsAPI->BeginRender("MainResultPass")) return false;
			if (!m_DeferredRenderer->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!m_SceneController->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!m_ScriptScene->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// Main FrameBuffer
		{
			if (!pGraphicsAPI->BeginRender()) return false;

			if (!m_MainFrameRenderer->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;

			// GUIEngine
#ifdef USE_GUIENGINE
			if (pLoadWorker->IsLoaded())
			{
				gui::SGUIParams GUIParams = gui::SGUIParams(GetObjectList(), m_SceneController, m_FileModifier, m_TimelineController, pLoadWorker);

				if (!GUIEngine->BeginFrame(pGraphicsAPI)) return false;
				if (!m_GraphicsEditingWindow->Draw(pGraphicsAPI, GUIParams, GUIEngine))
				{
					Console::Log("[Error] InValid GUI\n");
					return false;
				}
				if (!GUIEngine->EndFrame(pGraphicsAPI)) return false;
			}
#endif // USE_GUIENGINE

			if (!pLoadWorker->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;

			if (!pGraphicsAPI->EndRender()) return false;
		}

		return true;
	}

	const std::shared_ptr<graphics::CDrawInfo>& CDevApp::GetDrawInfo() const
	{
		return m_DrawInfo;
	}

	// 起動準備完了
	bool CDevApp::OnStartup(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		const auto& TimelineFileName = m_SceneController->GetTimelineFileName();
		if (!TimelineFileName.empty()) pLoadWorker->AddLoadResource(std::make_shared<resource::CTimelineClipLoader>(TimelineFileName, m_TimelineController->GetClip()));

		return true;
	}

	// ロード完了イベント
	bool CDevApp::OnLoaded(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		if (!m_SceneController->Create(pGraphicsAPI, pPhysicsEngine)) return false;

		if (!m_ScriptScene->OnLoaded(pGraphicsAPI, pPhysicsEngine, pLoadWorker)) return false;

		if (!m_TimelineController->Initialize(shared_from_this())) return false;

#ifdef USE_GUIENGINE
		{
			gui::SGUIParams GUIParams = gui::SGUIParams(GetObjectList(), m_SceneController, m_FileModifier, m_TimelineController, pLoadWorker);

			if (!m_GraphicsEditingWindow->OnLoaded(pGraphicsAPI, GUIParams, GUIEngine)) return false;
		}
#endif

		// カメラ
		{
			const auto& Object = m_SceneController->FindObjectByName("CameraObject");
			if (Object)
			{
				const auto& Node = Object->FindNodeByName("CameraNode");

				if (Node)
				{
					m_TraceCamera->SetTargetNode(Node);
				}
			}
		}

		return true;
	}

	// フォーカスイベント
	void CDevApp::OnFocus(bool Focused, api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		if (Focused && pLoadWorker)
		{
			m_FileModifier->OnFileUpdated(pLoadWorker);
		}
	}

	// エラー通知イベント
	void CDevApp::OnAssertError(const std::string& Message)
	{
#ifdef USE_GUIENGINE
		m_GraphicsEditingWindow->AddLog(gui::EGUILogType::Error, Message);
#endif
	}

	// Getter
	std::vector<std::shared_ptr<object::C3DObject>> CDevApp::GetObjectList() const
	{
		std::vector<std::shared_ptr<object::C3DObject>> ObjectList;

		for (const auto& Object : m_SceneController->GetObjectList())
		{
			ObjectList.push_back(Object);
		}

		if (m_ScriptScene)
		{
			for (const auto& Object : m_ScriptScene->GetObjectList())
			{
				ObjectList.push_back(Object);
			}
		}

		return ObjectList;
	}

	std::shared_ptr<scene::CSceneController> CDevApp::GetSceneController() const
	{
		return m_SceneController;
	}

	// タイムライン再生停止イベント
	void CDevApp::OnPlayedTimeline(bool IsPlay)
	{
	}
}

#endif // _DEBUG