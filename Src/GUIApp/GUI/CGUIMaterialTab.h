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
	class CMaterial; 
	enum class ECullMode;
}

namespace gui
{
	class CGUIMaterialTab
	{
	private:
		static bool DrawMaterialGUIOfObject(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, 
			const std::shared_ptr<scene::CSceneController>& SceneController, int SelectedObjectIndex);
		
		static bool DrawMaterialGUIOfNode(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController, 
			int SelectedObjectIndex, int SelectedNodeIndex);

		static bool DrawMaterialGUI(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<graphics::CMaterial>& Material, 
			const std::shared_ptr<scene::CSceneController>& SceneController);

		static float GetFloat(const std::vector<unsigned char>& BufferData, int Offset);
		static int GetInt(const std::vector<unsigned char>& BufferData, int Offset);

		static std::string GetStrFromCullMode(graphics::ECullMode CullMode);
	public:
		static bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController, 
			int SelectedObjectIndex, int SelectedNodeIndex);
	};
}
#endif