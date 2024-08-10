#ifdef USE_GUIENGINE

#pragma warning(disable : 4996)

#include "CGUILogTab.h"
#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <ctime>

namespace gui
{
	CGUILogTab::CGUILogTab():
		m_ShowErrorDialog(false),
		m_ErrorDialogMsg(std::make_tuple(gui::EGUILogType::Log, "", ""))
	{
	}

	bool CGUILogTab::Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams)
	{
		if (ImGui::BeginTabItem("Log"))
		{
			if (!DrawLogList()) return false;

			ImGui::EndTabItem();
		}

		if (m_ShowErrorDialog)
		{
			if (!DrawErrorDialog()) return false;
		}

		return true;
	}

	void CGUILogTab::AddLog(gui::EGUILogType LogType, const std::string Msg)
	{
		// ログ出力時刻をひかえておく
		std::string CurrentTime = GetCurrentTime();

		// 追加
		m_LogList.push_back(std::make_tuple(LogType, Msg, CurrentTime));

		// エラーメッセージを受け取ったならダイアログに表示する
		if (LogType == gui::EGUILogType::Error)
		{
			m_ShowErrorDialog = true;
			m_ErrorDialogMsg = std::make_tuple(LogType, Msg, CurrentTime);
		}
	}

	bool CGUILogTab::DrawLogList()
	{
		if (ImGui::BeginChild("Log##CGUILogTab_DrawLogList", ImVec2(ImGui::GetContentRegionAvail().x, ImGui::GetContentRegionAvail().y), ImGuiChildFlags_Border, 0))
		{
			int CloseLogIndex = -1;

			for (int i = 0; i < static_cast<int>(m_LogList.size()); i++)
			{
				const auto& Log = m_LogList[i];

				gui::EGUILogType LogType = std::get<0>(Log);

				// Color
				ImVec4 TextColor = ImVec4();
				switch (LogType)
				{
				case gui::EGUILogType::Log:
					TextColor = ImVec4(0.8f, 0.8f, 0.8f, 0.8f);
					break;
				case gui::EGUILogType::Warning:
					TextColor = ImVec4(1.0f, 1.0f, 0.0f, 1.0f);
					break;
				case gui::EGUILogType::Error:
					TextColor = ImVec4(1.0f, 0.0f, 0.0f, 1.0f);
					break;
				default:
					break;
				}

				// Msg
				ImGui::PushStyleColor(ImGuiCol_Text, TextColor);
				ImGui::TextWrapped("%s", std::get<1>(Log).c_str());
				ImGui::PopStyleColor();

				// Time
				ImGui::Text("%s", std::get<2>(Log).c_str());

				// Close
				ImGui::SameLine();
				
				if (ImGui::Button("Close##CGUILogTab_DrawLogList"))
				{
					CloseLogIndex = i;
				}
			}

			// 配列からログを削除する
			if (CloseLogIndex >= 0 && CloseLogIndex < static_cast<int>(m_LogList.size()))
			{
				m_LogList.erase(m_LogList.begin() + CloseLogIndex);

				m_LogList.shrink_to_fit();
			}

			ImGui::EndChild();
		}

		return true;
	}

	bool CGUILogTab::DrawErrorDialog()
	{
		ImGuiIO& io = ImGui::GetIO();

		ImVec2 WindowSize = ImVec2(io.DisplaySize.x * 0.75f, io.DisplaySize.y * 0.75f);

		ImGui::SetNextWindowPos(ImVec2(io.DisplaySize.x * 0.5f, io.DisplaySize.y * 0.5f), ImGuiCond_Appearing, ImVec2(0.5f, 0.5f));
		ImGui::SetNextWindowSize(WindowSize, ImGuiCond_Appearing);

		if (ImGui::Begin("ErrorDialog##CGUILogTab_DrawErrorDialog", &m_ShowErrorDialog))
		{
			//
			ImVec4 textColor = ImVec4(1.0f, 0.0f, 0.0f, 1.0f);

			ImGui::PushStyleColor(ImGuiCol_Text, textColor);
			ImGui::Text("%s", std::get<1>(m_ErrorDialogMsg).c_str());
			ImGui::PopStyleColor();

			//
			ImGui::Text("%s", std::get<2>(m_ErrorDialogMsg).c_str());
		}

		ImGui::End();

		return true;
	}

	std::string CGUILogTab::GetCurrentTime()
	{
		auto now = std::chrono::system_clock::now();

		std::time_t now_time_t = std::chrono::system_clock::to_time_t(now);

		std::tm* now_tm = std::localtime(&now_time_t);

		std::stringstream ss;
		ss << std::put_time(now_tm, "%Y-%m-%d %H:%M:%S");

		return ss.str();
	}
}
#endif