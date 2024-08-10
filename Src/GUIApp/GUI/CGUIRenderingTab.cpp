#ifdef USE_GUIENGINE
#include "CGUIRenderingTab.h"

namespace gui
{
	CGUIRenderingTab::CGUIRenderingTab()
	{
	}

	bool CGUIRenderingTab::Draw()
	{
		if (ImGui::BeginTabItem("Rendering"))
		{
			ImGui::EndTabItem();
		}

		return true;
	}
}
#endif