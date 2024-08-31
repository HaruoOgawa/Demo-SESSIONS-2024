#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <vector>
#include <memory>

#include "../../Math/CTransform.h"

namespace object {
	class C3DObject;
	class CNode;
}

namespace gui
{
	class CGUIBaseTab
	{
	private:
		static bool DrawTransformGUI(const std::shared_ptr<math::CTransform>& Transform);
	public:
		static bool Draw(const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, int SelectedObjectIndex, int SelectedNodeIndex);
	};
}
#endif