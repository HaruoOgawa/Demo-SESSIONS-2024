#pragma once

#ifdef USE_GUIENGINE

#include <string>
#include <memory>
#include <imgui.h>

#include "CGUIObjectTab.h"
#include "CGUIRenderingTab.h"
#include "CGUICameraTab.h"
#include "CGUIResourcesTab.h"
#include "CTimeLineView.h"
#include "CGUIMaterialFrameTab.h"
#include "CGUILogTab.h"

#include "SGUIParams.h"

#include <Interface/IGUIEngine.h>
#include <Interface/IApp.h>

namespace api { class IGraphicsAPI; }

namespace gui
{
	class CGraphicsEditingWindow
	{
		CGUIObjectTab m_GUIObjectTab;
		CGUIResourcesTab m_GUIResourcesTab;
		CTimeLineView m_TimeLineView;
		CGUIMaterialFrameTab m_MaterialFrameTab;
		CGUILogTab m_LogTab;
	public:
		CGraphicsEditingWindow();
		virtual ~CGraphicsEditingWindow();

		// ロード完了イベント
		bool OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine);

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams,  const std::shared_ptr<gui::IGUIEngine>& GUIEngine);

		void AddLog(gui::EGUILogType LogType, const std::string Msg);
	};
}
#endif // USE_GUIENGINE