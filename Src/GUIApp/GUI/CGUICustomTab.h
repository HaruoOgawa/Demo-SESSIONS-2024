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
	class CGUICustomTab
	{
	public:
		static bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
	};
}
#endif