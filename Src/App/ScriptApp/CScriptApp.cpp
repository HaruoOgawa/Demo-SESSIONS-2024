#include "CScriptApp.h"
#include "Scene/CScriptScene.h"

#include "../../Graphics/CDrawInfo.h"
#include "../../Graphics/CFrameRenderer.h"

#include "../../Camera/CCamera.h"
#include "../../Camera/CTraceCamera.h"
#ifdef USE_VIEWER_CAMERA
#include "../../Camera/CViewerCamera.h"
#endif // USE_VIEWER_CAMERA

#include "../../LoadWorker/CLoadWorker.h"
#include "../../Projection/CProjection.h"
#include "../../Message/Console.h"
#include "../../Interface/IGUIEngine.h"

#include "../../ImageEffect/CBloomEffect.h"
#include "../../ImageEffect/CLightShaft.h"
#include "../../ImageEffect/CSSR.h"
#include "../../ImageEffect/CSSWater.h"
#include "../../ImageEffect/CChromaticAberration.h"

#include "../../GUIApp/GUI/CGraphicsEditingWindow.h"
#include "../../GUIApp/Model/CFileModifier.h"
#include <Timeline/CTimelineController.h>
#include <Scene/CSceneController.h>

#include "../../Component/CTestComponent.h"

namespace app
{
	CScriptApp::CScriptApp() :
		m_SceneController(std::make_shared<scene::CSceneController>()),
		m_ScriptScene(nullptr),
		m_CameraSwitchToggle(false),
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
		m_EnabledGUIDraw(true),
		m_GraphicsEditingWindow(std::make_shared<gui::CGraphicsEditingWindow>()),
#endif // USE_GUIENGINE
		m_MainFrameRenderer(nullptr),
		m_MRTFrameRenderer(nullptr),
		m_BloomEffect(std::make_shared<imageeffect::CBloomEffect>("MainResultPass")),
		m_LightShaftEffect(std::make_shared<imageeffect::CLightShaft>("MainResultPass")),
		m_SSWaterEffect(std::make_shared<imageeffect::CSSWater>("MainResultPass")),
		m_ChromaticAberrationEffect(std::make_shared<imageeffect::CChromaticAberration>("MainResultPass")),
		m_SSREffect(std::make_shared<imageeffect::CSSR>("MainResultPass")),
		m_FileModifier(std::make_shared<CFileModifier>()),
		m_TimelineController(std::make_shared<timeline::CTimelineController>())
	{
		//m_ViewCamera->SetPos(glm::vec3(0.0f, 1.65, 2.5f));
		//m_ViewCamera->SetCenter(glm::vec3(0.0f, 1.65f, 0.0f));

		m_ViewCamera->SetPos(glm::vec3(0.0f, 0.0f, 3.0));

		//m_MainCamera = m_ViewCamera;
		m_MainCamera = m_TraceCamera;

		// ライトはあとでトレースカメラにする
		//m_DrawInfo->GetLightCamera()->SetPos(glm::vec3(-2.358f, 15.6f, -0.59f));
		//m_DrawInfo->GetLightCamera()->SetPos(glm::vec3(0.0f, 0.0f, 0.0f));
		m_DrawInfo->GetLightProjection()->SetNear(2.0f);
		m_DrawInfo->GetLightProjection()->SetFar(100.0f);

		m_SceneController->SetDefaultPass("MainResultPass", "");

#ifdef USE_GUIENGINE
		m_GraphicsEditingWindow->SetDefaultPass("MainResultPass", "");
#endif
	}

	bool CScriptApp::Release(api::IGraphicsAPI* pGraphicsAPI)
	{
		if (m_ScriptScene)
		{
			m_ScriptScene.reset();
			m_ScriptScene = nullptr;
		}

		return true;
	}

	// コンポーネント作成
	std::shared_ptr<scriptable::CComponent> CScriptApp::CreateComponent(const std::string& ComponentType, const std::string& ValueRegistry)
	{
		if (ComponentType == "TestComponent")
		{
			return std::make_shared<component::CTestComponent>(ComponentType, ValueRegistry);
		}

		return nullptr;
	}

	bool CScriptApp::Initialize(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		pLoadWorker->AddScene(std::make_shared<resource::CSceneLoader>("Resources\\Scene\\Demo-SESSIONS-2024.json", m_SceneController));

		// オフスクリーンレンダリング
		// MRTPass: Position(0), Normal(1), Albedo(2), Depth(3), Param1(4)
		if (!pGraphicsAPI->CreateRenderPass("MRTPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 5)) return false;
		if (!pGraphicsAPI->CreateRenderPass("MainResultPass", api::ERenderPassFormat::COLOR_FLOAT_RENDERPASS, glm::vec4(0.0f, 0.0f, 0.0f, 1.0f), -1, -1, 1)) return false;

		// ブルームエフェクト
		if (!m_BloomEffect->Initialize(pGraphicsAPI, pLoadWorker)) return false;

		// ライトシャフト
		if (!m_LightShaftEffect->Initialize(pGraphicsAPI, pLoadWorker, std::make_tuple("MRTPass", 3), std::make_tuple("BrigtnessPass", 0))) return false;

		// Screen Space Water
		if (!m_SSWaterEffect->Initialize(pGraphicsAPI, pLoadWorker, std::make_tuple("MRTPass", 3), std::make_tuple("MRTPass", 0),
			std::make_tuple("MRTPass", 1), std::make_tuple("MRTPass", 4))) return false;

		// SSR
		if (!m_SSREffect->Initialize(pGraphicsAPI, pLoadWorker, std::make_tuple("MRTPass", 3), std::make_tuple("MRTPass", 0),
			std::make_tuple("MRTPass", 1), std::make_tuple("MRTPass", 4))) return false;
		
		// ChromaticAberration
		if (!m_ChromaticAberrationEffect->Initialize(pGraphicsAPI, pLoadWorker)) return false;

		m_MRTFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "MainResultPass", pGraphicsAPI->FindOffScreenRenderPass("MRTPass")->GetFrameTextureList());
		if (!m_MRTFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\mrt_renderer_mf.json")) return false;

		m_MainFrameRenderer = std::make_shared<graphics::CFrameRenderer>(pGraphicsAPI, "", pGraphicsAPI->FindOffScreenRenderPass("MainResultPass")->GetFrameTextureList());
		if (!m_MainFrameRenderer->Create(pLoadWorker, "Resources\\MaterialFrame\\FrameTexture_MF.json")) return false;

		// Viewの初期化
		m_ScriptScene = std::make_shared<app::CScriptScene>(pGraphicsAPI, pLoadWorker, pPhysicsEngine);

		return true;
	}

	bool CScriptApp::ProcessInput(api::IGraphicsAPI* pGraphicsAPI)
	{
		return true;
	}

	bool CScriptApp::Resize(int Width, int Height)
	{
		m_Projection->SetScreenResolution(Width, Height);

		m_DrawInfo->GetLightProjection()->SetScreenResolution(Width, Height);

		return true;
	}

	bool CScriptApp::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<input::CInputState>& InputState)
	{
		// 常にタイムラインからの再生時間を渡す
		m_DrawInfo->SetSecondsTime(m_TimelineController->GetPlayBackTime());

		if (!m_FileModifier->Update(pLoadWorker)) return false;

		if (pLoadWorker->IsLoaded())
		{
			if (!m_TimelineController->Update(m_DrawInfo->GetDeltaSecondsTime(), InputState)) return false;
		}

		if (!m_SceneController->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState, m_TimelineController)) return false;
		if (!m_ScriptScene->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		m_MainCamera->Update(m_DrawInfo->GetDeltaSecondsTime(), InputState);
		m_DrawInfo->GetLightCamera()->Update(m_DrawInfo->GetDeltaSecondsTime(), InputState);

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

		if (!m_BloomEffect->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_LightShaftEffect->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_SSWaterEffect->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_SSREffect->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_ChromaticAberrationEffect->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		if (!m_MRTFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;
		if (!m_MainFrameRenderer->Update(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_MainCamera, m_Projection, m_DrawInfo, InputState)) return false;

		// GUIEngine
#ifdef USE_GUIENGINE
		if (InputState->IsKeyUp(input::EKeyType::KEY_TYPE_F1))
		{
			m_EnabledGUIDraw = !m_EnabledGUIDraw;
		}
#endif // USE_GUIENGINE

		return true;
	}

	bool CScriptApp::LateUpdate(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		if (!m_SceneController->LateUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		if (!m_ScriptScene->LateUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		return true;
	}

	bool CScriptApp::FixedUpdate(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker)
	{
		if (!m_SceneController->FixedUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		if (!m_ScriptScene->FixedUpdate(pGraphicsAPI, pPhysicsEngine, pLoadWorker, m_DrawInfo)) return false;

		return true;
	}

	bool CScriptApp::Draw(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<input::CInputState>& InputState, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		// MRTPass
		{
			if (!pGraphicsAPI->BeginRender("MRTPass")) return false;
			if (!m_SceneController->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// MainResultPass
		{
			if (!pGraphicsAPI->BeginRender("MainResultPass")) return false;
			if (!m_MRTFrameRenderer->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!m_SceneController->Draw(pGraphicsAPI, false, m_MainCamera, m_Projection, m_DrawInfo)) return false;
			if (!pGraphicsAPI->EndRender()) return false;
		}

		// LightShaft
		//if (!m_LightShaftEffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;
		
		// SSWater
		if (!m_SSWaterEffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo, m_SceneController)) return false;
		
		// SSR
		if (!m_SSREffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;
		
		// ChromaticAberration
		if (!m_ChromaticAberrationEffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;

		// BloomEffect
		if (!m_BloomEffect->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;

		// Main FrameBuffer
		{
			if (!pGraphicsAPI->BeginRender()) return false;
			
			if (!m_MainFrameRenderer->Draw(pGraphicsAPI, m_MainCamera, m_Projection, m_DrawInfo)) return false;

			// GUIEngine
#ifdef USE_GUIENGINE
			if (pLoadWorker->IsLoaded() && m_EnabledGUIDraw)
			{
				gui::SGUIParams GUIParams = gui::SGUIParams(GetObjectList(), m_SceneController, m_FileModifier, m_TimelineController, pLoadWorker, {});
				
				GUIParams.ValueRegistryList.emplace(m_BloomEffect->GetRegistryName(), m_BloomEffect);
				GUIParams.ValueRegistryList.emplace(m_ChromaticAberrationEffect->GetRegistryName(), m_ChromaticAberrationEffect);
				GUIParams.CameraMode = (m_CameraSwitchToggle) ? "ViewCamera" : "TraceCamera";
				GUIParams.Camera = m_MainCamera;
				GUIParams.InputState = InputState;

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

	const std::shared_ptr<graphics::CDrawInfo>& CScriptApp::GetDrawInfo() const
	{
		return m_DrawInfo;
	}

	// 起動準備完了
	bool CScriptApp::OnStartup(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		const auto& TimelineFileName = m_SceneController->GetTimelineFileName();
		if (!TimelineFileName.empty()) pLoadWorker->AddLoadResource(std::make_shared<resource::CTimelineClipLoader>(TimelineFileName, m_TimelineController->GetClip()));

		return true;
	}

	// ロード完了イベント
	bool CScriptApp::OnLoaded(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		if (!m_SceneController->Create(pGraphicsAPI, pPhysicsEngine)) return false;

		if (!m_ScriptScene->OnLoaded(pGraphicsAPI, pPhysicsEngine, pLoadWorker)) return false;

		{
			auto Component = CreateComponent("TestComponent", "test");
		}

		m_BloomEffect->OnLoaded(m_SceneController);
		m_ChromaticAberrationEffect->OnLoaded(m_SceneController);

		if (!m_TimelineController->Initialize(shared_from_this())) return false;

#ifdef USE_GUIENGINE
		{
			gui::SGUIParams GUIParams = gui::SGUIParams(GetObjectList(), m_SceneController, m_FileModifier, m_TimelineController, pLoadWorker, {});

			GUIParams.ValueRegistryList.emplace(m_BloomEffect->GetRegistryName(), m_BloomEffect);
			GUIParams.ValueRegistryList.emplace(m_ChromaticAberrationEffect->GetRegistryName(), m_ChromaticAberrationEffect);

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

		// ライト
		{
			// ライトの方もトレースカメラにする
			std::shared_ptr<camera::CTraceCamera> LightTraceCamera = std::make_shared<camera::CTraceCamera>();

			const auto& Object = m_SceneController->FindObjectByName("LightObject");
			if (Object)
			{
				const auto& Node = Object->FindNodeByName("LightNode");

				if (Node)
				{
					LightTraceCamera->SetTargetNode(Node);
				}
			}

			m_DrawInfo->SetLightCamera(LightTraceCamera);
		}

		// タイムラインの再生開始
		m_TimelineController->Play();

		return true;
	}

	// フォーカスイベント
	void CScriptApp::OnFocus(bool Focused, api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker)
	{
		if (Focused && pLoadWorker)
		{
			m_FileModifier->OnFileUpdated(pLoadWorker);
		}
	}

	// エラー通知イベント
	void CScriptApp::OnAssertError(const std::string& Message)
	{
#ifdef USE_GUIENGINE
		m_GraphicsEditingWindow->AddLog(gui::EGUILogType::Error, Message);
#endif
	}

	// Getter
	std::vector<std::shared_ptr<object::C3DObject>> CScriptApp::GetObjectList() const
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

	std::shared_ptr<scene::CSceneController> CScriptApp::GetSceneController() const
	{
		return m_SceneController;
	}

	// タイムライン再生停止イベント
	void CScriptApp::OnPlayedTimeline(bool IsPlay)
	{
		const auto& Sound = m_SceneController->GetSound();
		const auto& SoundClip = std::get<0>(Sound);
		if (SoundClip)
		{
			if (IsPlay)
			{
				SoundClip->SetPlayPos(m_TimelineController->GetPlayBackTime());
				SoundClip->PlayOneShot();
			}
			else
			{
				SoundClip->Stop();
			}
		}
	}
}