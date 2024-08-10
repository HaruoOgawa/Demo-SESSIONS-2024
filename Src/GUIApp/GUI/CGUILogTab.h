#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <vector>
#include <memory>
#include <tuple>

#include "SGUIParams.h"

namespace api { class IGraphicsAPI; }

namespace gui
{
	enum class EGUILogType
	{
		Log,
		Warning,
		Error,
	};

	class CGUILogTab
	{
		std::vector<std::tuple<gui::EGUILogType, std::string, std::string>> m_LogList;

		bool m_ShowErrorDialog;
		std::tuple<gui::EGUILogType, std::string, std::string> m_ErrorDialogMsg;

	private:
		bool DrawLogList();
		bool DrawErrorDialog();

		static std::string GetCurrentTime();
	public:
		CGUILogTab();
		virtual ~CGUILogTab() = default;

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);

		void AddLog(gui::EGUILogType LogType, const std::string Msg);
	};
}
#endif