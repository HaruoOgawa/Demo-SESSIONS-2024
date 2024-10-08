#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <vector>
#include <memory>

#include "SGUIParams.h"

namespace api { class IGraphicsAPI; }

namespace object { 
	class C3DObject; 
	class CNode;
}

namespace gui
{
	class CGUIObjectTab
	{
		int m_OperateButtonID;

		int m_SelectedObjectIndex;
		int m_SelectedNodeIndex;

		std::string m_SelectedName;

		// オブジェクト追加ダイアログ
		bool m_ShowAddObjectDialog;

		// ノード追加ダイアログ
		bool m_ShowAddNodeDialog;
	private:
		void Reset();

		bool DrawObjectList(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
		bool DrawNodeGUI(int& SelectedObjectIndex, int& SelectedNodeIndex, int CurrentObjectIndex, int CurrentNodeIndex, 
			const std::shared_ptr<object::CNode>& Node, const std::vector<std::shared_ptr<object::CNode>>& NodeList);
		bool DrawObjectDetail(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);

		bool DrawAddObjectDialog(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
		bool DrawAddNodeDialog(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);

	public:
		CGUIObjectTab();
		virtual ~CGUIObjectTab() = default;

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams);
	};
}
#endif