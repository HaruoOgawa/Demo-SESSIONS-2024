#pragma once

#ifdef USE_GUIENGINE
#include <imgui.h>
#include <string>
#include <vector>
#include <memory>

namespace api { class IGraphicsAPI; }
namespace scene { class CSceneController; }

namespace object {
	class C3DObject;
	class CNode;
}

namespace graphics {
	class CMesh;
	enum class EPresetPrimitiveType;
}

namespace gui
{
	class CGUIMeshTab
	{
	private:
		static bool DrawMeshGUIOfObject(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList,
			const std::shared_ptr<scene::CSceneController>& SceneController, int SelectedObjectIndex);

		static bool DrawMeshGUIOfNode(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController,
			int SelectedObjectIndex, int SelectedNodeIndex);

		static bool DrawMeshGUI(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<graphics::CMesh>& Mesh, int MeshIndex,
			const std::shared_ptr<scene::CSceneController>& SceneController);

		static std::string GetStrFromPresetPrimitiveType(graphics::EPresetPrimitiveType PresetType);
	public:
		static bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController,
			int SelectedObjectIndex, int SelectedNodeIndex);
	};
}
#endif