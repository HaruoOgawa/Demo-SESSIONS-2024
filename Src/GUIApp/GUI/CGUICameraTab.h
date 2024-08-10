#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>

namespace gui
{
	class CGUICameraTab
	{
	public:
		CGUICameraTab();
		virtual ~CGUICameraTab() = default;

		static bool Draw();
	};
}
#endif