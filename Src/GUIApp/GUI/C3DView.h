#pragma once

#ifdef USE_GUIENGINE

#include <string>
#include <memory>
#include <imgui.h>

#include "SGUIParams.h"

#include <Interface/IGUIEngine.h>
#include <AppCore/CApp.h>

namespace api { class IGraphicsAPI; }

namespace gui
{
	class C3DView
	{
		bool m_IsFullScreen;

		std::string m_SelectedPassName;
		int			m_SelectedTextureIndex;

	private:
		bool DrawOption(const ImVec2& WindowSize, const SGUIParams& GUIParams);
		bool DrawFullScreen(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize);
		bool DrawPassList(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize);

	public:
		C3DView();
		virtual ~C3DView() = default;

		bool IsFullScreen() const;

		void SetDefaultPass(const std::string& RenderPass, const std::string& DepthPass);

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams, const std::shared_ptr<gui::IGUIEngine>& GUIEngine, const ImVec2& WindowSize, const ImVec2& FullImageSize);
	};
}
#endif // USE_GUIENGINE