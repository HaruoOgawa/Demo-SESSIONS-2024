#ifdef USE_GUIENGINE
#include "CGUIBaseTab.h"
#include "../../Object/C3DObject.h"

namespace gui
{
	bool CGUIBaseTab::Draw(const std::vector<std::shared_ptr<object::C3DObject>>& ObjectList, int SelectedObjectIndex, int SelectedNodeIndex)
	{
		if (ImGui::BeginTabItem("Base"))
		{
			if (SelectedObjectIndex >= 0 && SelectedObjectIndex < static_cast<int>(ObjectList.size()))
			{
				const auto& Object = ObjectList[SelectedObjectIndex];

				// PassName
				{
					std::string PassName = Object->GetPassName();

					char buf[256] = "";
					std::memcpy(&buf[0], &PassName[0], PassName.size());
					
					if (ImGui::InputText("PassName##CGUIBaseTab::Draw", buf, IM_ARRAYSIZE(buf)))
					{
						PassName = std::string(buf);

						Object->SetPassName(PassName);
					}
				}

				// DepthPass
				{
					std::string DepthPass = Object->GetDepthPassName();

					char buf[256] = "";
					std::memcpy(&buf[0], &DepthPass[0], DepthPass.size());
					
					if (ImGui::InputText("DepthPass##CGUIBaseTab::Draw", buf, IM_ARRAYSIZE(buf)))
					{
						DepthPass = std::string(buf);

						Object->SetDepthPassName(DepthPass);
					}
				}

				const auto& NodeList = Object->GetNodeList();
				const auto& MeshList = Object->GetMeshList();

				if (SelectedNodeIndex >= 0 && SelectedNodeIndex < static_cast<int>(NodeList.size()))
				{
					//ImGui::SeparatorText("Node Transform");

					const auto& Node = NodeList[SelectedNodeIndex];

					// メッシュ
					int MeshIndex = Node->GetMeshIndex();
					if (ImGui::InputInt("MeshIndex##CGUIBaseTab", &MeshIndex))
					{
						if (MeshIndex >= 0 && MeshIndex < static_cast<int>(MeshList.size()))
						{
							Node->SetMeshIndex(MeshIndex);
						}
					}

					// Node Transformを表示
					const auto& Transform = Node->GetLocalTransform();

					if (!DrawTransformGUI(Transform)) return false;
				}
				else
				{
					//ImGui::SeparatorText("Object Transform");

					// Object Transformを表示
					const auto& Transform = Object->GetObjectTransform();

					if (!DrawTransformGUI(Transform)) return false;
				}
			}

			ImGui::EndTabItem();
		}

		return true;
	}

	bool CGUIBaseTab::DrawTransformGUI(const std::shared_ptr<math::CTransform>& Transform)
	{
		// Pos
		glm::vec3 Pos = Transform->GetPos();

		if(ImGui::InputFloat3("Position", &Pos[0]))
		{
			Transform->SetPos(Pos);
		}

		// Rotate
		glm::quat Rot = Transform->GetRot();
		glm::vec3 Euler = glm::eulerAngles(Rot);
		glm::vec3 Degree = glm::vec3(glm::degrees(Euler.x), glm::degrees(Euler.y), glm::degrees(Euler.z));
		const glm::vec3 PreDegree = Degree;

		if (ImGui::InputFloat3("Rotation", &Degree[0]))
		{
			if (PreDegree.x != Degree.x || PreDegree.y != Degree.y || PreDegree.z != Degree.z)
			{
				Rot = glm::angleAxis(glm::radians(Degree.z), glm::vec3(0.0f, 0.0f, 1.0f)) * glm::angleAxis(glm::radians(Degree.y), glm::vec3(0.0f, 1.0f, 0.0f)) * glm::angleAxis(glm::radians(Degree.x), glm::vec3(1.0f, 0.0f, 0.0f));
			}
			
			Transform->SetRot(Rot);
		}

		// Scale
		glm::vec3 Scale = Transform->GetScale();

		if (ImGui::InputFloat3("Scale", &Scale[0]))
		{
			Transform->SetScale(Scale);
		}

		return true;
	}
}
#endif