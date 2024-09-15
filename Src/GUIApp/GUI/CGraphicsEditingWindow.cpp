#ifdef USE_GUIENGINE
#include "CGraphicsEditingWindow.h"
#include "../../Message/Console.h"

namespace gui
{
	CGraphicsEditingWindow::CGraphicsEditingWindow()
	{
	}

	CGraphicsEditingWindow::~CGraphicsEditingWindow()
	{
	}

	// ロード完了イベント
	bool CGraphicsEditingWindow::OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		if (!m_TimeLineView.Initialize(GUIParams.TimelineController, GUIParams.ObjectList)) return false;

		return true;
	}

	bool CGraphicsEditingWindow::Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine)
	{
		// ウィンドウの初期位置・サイズ
		float padding = 0.0f;
		ImGuiIO& io = ImGui::GetIO();

		const float MainMenuWidthRate = 0.25f;
		const float TimeLineHeightRate = 0.25f;

		// MainMenuView
		{
			ImGui::SetNextWindowPos(ImVec2(io.DisplaySize.x - padding, padding), ImGuiCond_Always, ImVec2(1.0f, 0.0f));
			ImGui::SetNextWindowSize(ImVec2(io.DisplaySize.x * MainMenuWidthRate, io.DisplaySize.y), ImGuiCond_Always);

			bool Open = true;
			if (ImGui::Begin("MainMenuView", &Open, ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoSavedSettings | ImGuiWindowFlags_NoTitleBar))
			{
				if (ImGui::BeginTabBar("MainMenuBar"))
				{
					if (!m_GUIObjectTab.Draw(pGraphicsAPI, GUIParams)) return false;
					if (!m_GUIResourcesTab.Draw(GUIParams.FileModifier)) return false;
					if (!m_MaterialFrameTab.Draw(pGraphicsAPI, GUIParams)) return false;
					if (!m_LogTab.Draw(pGraphicsAPI, GUIParams)) return false;
					if (!CGUIRenderingTab::Draw()) return false;
					if (!CGUICameraTab::Draw()) return false;
					if (!CGUICustomTab::Draw(pGraphicsAPI, GUIParams)) return false;

					ImGui::EndTabBar();
				}
			}

			ImGui::End();
		}

		// TimeLineView
		{
			ImGui::SetNextWindowPos(ImVec2(padding, io.DisplaySize.y - padding), ImGuiCond_Always, ImVec2(0.0f, 1.0f));
			ImGui::SetNextWindowSize(ImVec2(io.DisplaySize.x * (1.0f - MainMenuWidthRate), io.DisplaySize.y * TimeLineHeightRate), ImGuiCond_Always);

			bool Open = true;
			if (ImGui::Begin("TimeLineView", &Open, ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoSavedSettings | ImGuiWindowFlags_NoTitleBar))
			{
				if (!m_TimeLineView.Draw(GUIParams.TimelineController, GUIParams.ObjectList)) return false;
			}

			ImGui::End();
		}

		// 3DView
		{
			ImGui::SetNextWindowPos(ImVec2(padding, io.DisplaySize.y * (1.0f - TimeLineHeightRate)), ImGuiCond_Always, ImVec2(0.0f, 1.0f));
			ImGui::SetNextWindowSize(ImVec2(io.DisplaySize.x * (1.0f - MainMenuWidthRate), io.DisplaySize.y * (1.0f - TimeLineHeightRate)), ImGuiCond_Always);

			bool Open = true;

			ImGuiWindowFlags flags = ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoSavedSettings |
				ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoInputs;

			if (ImGui::Begin("3DView", &Open, flags))
			{
				ImVec2 WindowSize = ImGui::GetWindowSize();
				ImVec2 ImageSize = ImVec2(io.DisplaySize.x * (1.0f - TimeLineHeightRate), io.DisplaySize.y * (1.0f - TimeLineHeightRate));

				if (!m_3DView.Draw(pGraphicsAPI, GUIParams, GUIEngine, WindowSize, ImageSize)) return false;
			}

			ImGui::End();
		}

		return true;
	}

	void CGraphicsEditingWindow::AddLog(gui::EGUILogType LogType, const std::string Msg)
	{
		m_LogTab.AddLog(LogType, Msg);
	}

	void CGraphicsEditingWindow::SetDefaultPass(const std::string& RenderPass, const std::string& DepthPass)
	{
		m_3DView.SetDefaultPass(RenderPass, DepthPass);
	}
}
#endif // USE_GUIENGINE