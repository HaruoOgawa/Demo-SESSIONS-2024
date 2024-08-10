#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>

namespace gui
{
	class CGUIRenderingTab
	{
	public:
		CGUIRenderingTab();
		virtual ~CGUIRenderingTab() = default;

		static bool Draw();
	};
}
#endif