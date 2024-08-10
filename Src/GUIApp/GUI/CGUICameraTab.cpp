#ifdef USE_GUIENGINE
#include "CGUICameraTab.h"

namespace gui
{
	CGUICameraTab::CGUICameraTab()
	{
	}

	bool CGUICameraTab::Draw()
	{
		if (ImGui::BeginTabItem("Camera"))
		{
			ImGui::EndTabItem();
		}

		return true;
	}
}
#endif