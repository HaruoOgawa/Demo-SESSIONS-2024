#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <vector>
#include <memory>

#include "SGUIParams.h"

namespace api { class IGraphicsAPI; }

namespace gui
{
	class CGUIMaterialFrameTab
	{
		bool m_ShowAddMFDialog;
	private:
		bool DrawMaterialFrameList(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
		bool DrawAddMFDialog(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
	public:
		CGUIMaterialFrameTab();
		virtual ~CGUIMaterialFrameTab() = default;

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
	};
}
#endif