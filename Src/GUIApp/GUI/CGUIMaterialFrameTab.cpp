#ifdef USE_GUIENGINE
#include "CGUIMaterialFrameTab.h"
#include <Scene/CSceneController.h>

namespace gui
{
	CGUIMaterialFrameTab::CGUIMaterialFrameTab():
		m_ShowAddMFDialog(false)
	{
	}

	bool CGUIMaterialFrameTab::Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams)
	{
		if (ImGui::BeginTabItem("MaterialFrame"))
		{
			if (!DrawMaterialFrameList(pGraphicsAPI, GUIParams)) return false;

			ImGui::EndTabItem();
		}

		if (m_ShowAddMFDialog)
		{
			if (!DrawAddMFDialog(pGraphicsAPI, GUIParams)) return false;
		}

		return true;
	}

	bool CGUIMaterialFrameTab::DrawMaterialFrameList(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams)
	{
		if (ImGui::BeginChild("MaterialFrameList", ImVec2(ImGui::GetContentRegionAvail().x, ImGui::GetContentRegionAvail().y), ImGuiChildFlags_Border, 0))
		{
			//
			if (ImGui::Button("AddMaterialFrame##GUIMaterialFrameTab"))
			{
				m_ShowAddMFDialog = true;
			}

			//
			ImGui::SeparatorText("MaterialFrameList##GUIMaterialFrameTab_SeparatorText");

			//
			for (const auto& MaterialFrame : GUIParams.SceneController->GetMaterialFrameMap())
			{
				std::string Label = MaterialFrame.first /*+ "##GUIMaterialFrameTab_MaterialFrameName"*/;
				ImGui::Text("%s", Label.c_str());
			}

			ImGui::EndChild();
		}

		return true;
	}

	bool CGUIMaterialFrameTab::DrawAddMFDialog(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams)
	{
		ImGuiIO& io = ImGui::GetIO();

		ImVec2 WindowSize = ImVec2(io.DisplaySize.x * 0.15f, io.DisplaySize.y * 0.15f);

		ImGui::SetNextWindowPos(ImVec2(io.MousePos.x - WindowSize.x * 0.5f, io.MousePos.y - WindowSize.y * 0.5f), ImGuiCond_Appearing, ImVec2(0.0f, 0.0f));
		ImGui::SetNextWindowSize(WindowSize, ImGuiCond_Appearing);

		if (ImGui::Begin("AddMFDialog##GUIMaterialFrameTab", &m_ShowAddMFDialog))
		{
			// MFName
			static std::string MFName = std::string();
			{
				static char buf[256] = "";
				if (ImGui::InputText("MaterialFrameName##AddMFDialog_FileName", buf, IM_ARRAYSIZE(buf)))
				{
					MFName = std::string(buf);
				}
			}

			// FileName
			static std::string FileName = std::string();
			{
				static char buf[256] = "";
				if (ImGui::InputText("FileName##AddMFDialog_FileName", buf, IM_ARRAYSIZE(buf)))
				{
					FileName = std::string(buf);
				}
			}

			if (ImGui::Button("Add##GUIMaterialFrameTab") && !MFName.empty() && !FileName.empty())
			{
				m_ShowAddMFDialog = false;

				// MaterialFrameì¬
				GUIParams.SceneController->AddMaterialFrameWithLoading(GUIParams.pLoadWorker, FileName);
			}
		}

		ImGui::End();

		return true;
	}
}

#endif