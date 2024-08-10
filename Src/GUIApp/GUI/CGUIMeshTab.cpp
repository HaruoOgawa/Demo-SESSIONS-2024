#ifdef USE_GUIENGINE
#include "CGUIMeshTab.h"
#include "../../Scene/CSceneController.h"
#include "../../Interface/IGraphicsAPI.h"
#include "../../Object/C3DObject.h"

namespace gui
{
	bool CGUIMeshTab::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController,
		int SelectedObjectIndex, int SelectedNodeIndex)
	{
		if (ImGui::BeginTabItem("Mesh"))
		{
			if (SelectedObjectIndex != -1)
			{
				if (SelectedNodeIndex == -1)
				{
					// Objectのメッシュリスト
					if (!DrawMeshGUIOfObject(pGraphicsAPI, ObjectList, SceneController, SelectedObjectIndex)) return false;
				}
				else
				{
					// Nodeのメッシュリスト
					if (!DrawMeshGUIOfNode(pGraphicsAPI, ObjectList, SceneController, SelectedObjectIndex, SelectedNodeIndex)) return false;
				}
			}

			ImGui::EndTabItem();
		}

		return true;
	}

	bool CGUIMeshTab::DrawMeshGUIOfObject(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList,
		const std::shared_ptr<scene::CSceneController>& SceneController, int SelectedObjectIndex)
	{
		// Objectを取得
		if (SelectedObjectIndex < 0 || SelectedObjectIndex >= static_cast<int>(ObjectList.size())) return true;

		const auto& Object = ObjectList[SelectedObjectIndex];

		const auto& MaterialList = Object->GetMaterialList();

		// Create Mesh
		{
			ImGui::SeparatorText("CreateMesh");

			// PresetType
			static graphics::EPresetPrimitiveType PresetType = graphics::EPresetPrimitiveType::None;
			{
				if (ImGui::BeginCombo("PresetType##DrawMeshGUIOfObject_CGUIMeshTab", GetStrFromPresetPrimitiveType(PresetType).c_str()))
				{
					for (int i = 0; i < static_cast<int>(graphics::EPresetPrimitiveType::Max); i++)
					{
						graphics::EPresetPrimitiveType CurrentPresetType = static_cast<graphics::EPresetPrimitiveType>(i);

						const bool IsSelected = (PresetType == CurrentPresetType);

						if (ImGui::Selectable(GetStrFromPresetPrimitiveType(CurrentPresetType).c_str(), IsSelected) && !IsSelected)
						{
							PresetType = CurrentPresetType;
						}
					}

					ImGui::EndCombo();
				}
			}

			// Material
			static int MaterialIndex = -1;
			{
				std::string MaterialName = std::string();
				if (MaterialIndex >= 0 && MaterialIndex < static_cast<int>(MaterialList.size()))
				{
					MaterialName = MaterialList[MaterialIndex]->GetMaterialName();
				}

				if (ImGui::BeginCombo("MaterialIndex##DrawMeshGUIOfObject_CGUIMeshTab", MaterialName.c_str()))
				{
					for (int i = 0; i < static_cast<int>(MaterialList.size()); i++)
					{
						const bool IsSelected = (MaterialIndex == i);

						const auto& CurrentMaterial = MaterialList[i];

						if (ImGui::Selectable(CurrentMaterial->GetMaterialName().c_str(), IsSelected) && !IsSelected)
						{
							MaterialIndex = i;
						}
					}

					ImGui::EndCombo();
				}
			}

			// AddMesh
			{
				if (ImGui::Button("AddMesh##DrawMeshGUIOfObject_CGUIMeshTab"))
				{
					if (PresetType != graphics::EPresetPrimitiveType::None)
					{
						std::shared_ptr<graphics::CMesh> Mesh = std::make_shared<graphics::CMesh>();

						const auto& CreateInfo = graphics::CPresetPrimitive::CreateFromType(pGraphicsAPI, PresetType);
						Mesh->CreatePresetSimpleMesh(CreateInfo.first, CreateInfo.second, MaterialIndex, PresetType);

						// プリセットなので即時生成
						if (!Mesh->Create(pGraphicsAPI, MaterialList, Object->GetPassName(), Object->GetDepthPassName())) return false;

						Object->AddMesh(Mesh);
					}

					PresetType = graphics::EPresetPrimitiveType::None;
					MaterialIndex = -1;
				}
			}
		}

		// Draw Mesh
		{
			ImGui::SeparatorText("MeshList");

			const auto& MeshList = Object->GetMeshList();

			for (int MeshIndex = 0; MeshIndex < static_cast<int>(MeshList.size()); MeshIndex++)
			{
				const auto& Mesh = MeshList[MeshIndex];

				if (!DrawMeshGUI(pGraphicsAPI, Object, Mesh, MeshIndex, SceneController)) return false;
			}
		}

		return true;
	}

	bool CGUIMeshTab::DrawMeshGUIOfNode(api::IGraphicsAPI* pGraphicsAPI, const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, const std::shared_ptr<scene::CSceneController>& SceneController,
		int SelectedObjectIndex, int SelectedNodeIndex)
	{
		if (SelectedObjectIndex == -1 || SelectedNodeIndex == -1) return true;

		// Objectを取得
		if (SelectedObjectIndex < 0 || SelectedObjectIndex >= static_cast<int>(ObjectList.size())) return true;

		const auto& Object = ObjectList[SelectedObjectIndex];

		// Nodeを取得
		const auto& NodeList = Object->GetNodeList();
		if (SelectedNodeIndex < 0 || SelectedNodeIndex >= static_cast<int>(NodeList.size())) return true;

		const auto& Node = NodeList[SelectedNodeIndex];

		// Meshを取得
		const auto& MeshList = Object->GetMeshList();
		int MeshIndex = Node->GetMeshIndex();
		if (MeshIndex < 0 || MeshIndex >= static_cast<int>(MeshList.size())) return true;

		const auto& Mesh = MeshList[MeshIndex];

		if (!DrawMeshGUI(pGraphicsAPI, Object, Mesh, MeshIndex, SceneController)) return false;

		return true;
	}

	bool CGUIMeshTab::DrawMeshGUI(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<graphics::CMesh>& Mesh, int MeshIndex,
		const std::shared_ptr<scene::CSceneController>& SceneController)
	{
		const auto& MaterialList = Object->GetMaterialList();

		std::string TreeNodeLabel_Mesh = "Mesh##" + std::to_string(MeshIndex) + "GUIMeshTab_DrawMeshGUI_TreeNodeEx_Mesh_" + Object->GetObjectName();
		if (ImGui::TreeNodeEx(TreeNodeLabel_Mesh.c_str(), ImGuiTreeNodeFlags_Framed))
		{
			const auto& PrimitiveList = Mesh->GetPrimitiveList();

			for (int PrimitiveIndex = 0; PrimitiveIndex < static_cast<int>(PrimitiveList.size()); PrimitiveIndex++)
			{
				const auto& Primitive = PrimitiveList[PrimitiveIndex];

				std::string TreeNodeLabel_Primitive = "Primitive##" + std::to_string(PrimitiveIndex) + "GUIMeshTab_DrawMeshGUI_TreeNodeEx_Primitive_" + Object->GetObjectName();
				if (ImGui::TreeNodeEx(TreeNodeLabel_Primitive.c_str(), ImGuiTreeNodeFlags_Framed))
				{
					{
						graphics::EPresetPrimitiveType PresetType = Primitive->GetPresetType();

						std::string Text = "PresetType: " + GetStrFromPresetPrimitiveType(PresetType);

						ImGui::Text("%s", Text.c_str());
					}

					int MaterialIndex = Primitive->GetMaterialIndex();

					if (MaterialIndex >= 0 && MaterialIndex < static_cast<int>(MaterialList.size()))
					{
						const auto& Material = MaterialList[MaterialIndex];

						std::string Text = "MaterialName: " + Material->GetMaterialName();

						ImGui::Text("%s", Text.c_str());
					}

					ImGui::TreePop();
				}
			}

			ImGui::TreePop();
		}

		return true;
	}

	std::string CGUIMeshTab::GetStrFromPresetPrimitiveType(graphics::EPresetPrimitiveType PresetType)
	{
		std::string Text = "";

		switch (PresetType)
		{
		case graphics::EPresetPrimitiveType::None:
			Text = "None";
			break;
		case graphics::EPresetPrimitiveType::BOARD:
			Text = "BOARD";
			break;
		case graphics::EPresetPrimitiveType::CUBE:
			Text = "CUBE";
			break;
		case graphics::EPresetPrimitiveType::POINT:
			Text = "POINT";
			break;
		case graphics::EPresetPrimitiveType::SPHERE:
			Text = "SPHERE";
			break;
		default:
			break;
		}

		return Text;
	}
}
#endif