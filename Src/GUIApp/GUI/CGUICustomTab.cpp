#ifdef USE_GUIENGINE
#include "CGUICustomTab.h"
#include <Scriptable/CValueRegistry.h>

namespace gui
{
	bool CGUICustomTab::Draw(api::IGraphicsAPI* pGraphicsAPI, const SGUIParams& GUIParams)
	{
		if (ImGui::BeginTabItem("Custom"))
		{
			static std::string SelectedRegistry = std::string();

			if (ImGui::BeginCombo("Registry##CGUICustomTab", SelectedRegistry.c_str()))
			{
				for (const auto& Registry : GUIParams.ValueRegistryList)
				{
					const bool IsSelected = (SelectedRegistry == Registry.first);

					std::string Label = Registry.first;
					if (ImGui::Selectable(Label.c_str(), IsSelected) && !IsSelected)
					{
						SelectedRegistry = Label;
					}
				}

				ImGui::EndCombo();
			}

			if (!SelectedRegistry.empty())
			{
				const auto& it = GUIParams.ValueRegistryList.find(SelectedRegistry);
				if (it != GUIParams.ValueRegistryList.end())
				{
					const auto& ValueRegistry = it->second;

					for (const auto& Value : ValueRegistry->GetValueList())
					{
						const std::string& Name = Value.second.Name;
						graphics::EUniformValueType Type = Value.second.Type;
						int ByteSize = Value.second.ByteSize;
						const auto& Buffer = Value.second.Buffer;

						switch (Type)
						{
						case graphics::EUniformValueType::NONE:
							continue;
						case graphics::EUniformValueType::VALUE_TYPE_MAT4:
							continue;
						case graphics::EUniformValueType::VALUE_TYPE_MAT3:
							continue;
						case graphics::EUniformValueType::VALUE_TYPE_MAT2:
							continue;
						case graphics::EUniformValueType::VALUE_TYPE_VEC4:
						{
							glm::vec4 val = glm::vec4(0.0f);
							std::memcpy(&val[0], &Buffer[0], ByteSize);

							if (ImGui::InputFloat4(Name.c_str(), &val[0]))
							{
								ValueRegistry->SetValue(Name, Type, &val[0], ByteSize);
							}
						}
						break;
						case graphics::EUniformValueType::VALUE_TYPE_VEC3:
						{
							glm::vec3 val = glm::vec3(0.0f);
							std::memcpy(&val[0], &Buffer[0], ByteSize);

							if (ImGui::InputFloat3(Name.c_str(), &val[0]))
							{
								ValueRegistry->SetValue(Name, Type, &val[0], ByteSize);
							}
						}
						break;
						case graphics::EUniformValueType::VALUE_TYPE_VEC2:
						{
							glm::vec2 val = glm::vec2(0.0f);
							std::memcpy(&val[0], &Buffer[0], ByteSize);

							if (ImGui::InputFloat2(Name.c_str(), &val[0]))
							{
								ValueRegistry->SetValue(Name, Type, &val[0], ByteSize);
							}
						}
						break;
						case graphics::EUniformValueType::VALUE_TYPE_FLOAT:
						{
							glm::vec1 val = glm::vec1(0.0f);
							std::memcpy(&val[0], &Buffer[0], ByteSize);

							if (ImGui::InputFloat(Name.c_str(), &val[0]))
							{
								ValueRegistry->SetValue(Name, Type, &val[0], ByteSize);
							}
						}
						break;
						case graphics::EUniformValueType::VALUE_TYPE_INT:
						{
							glm::ivec1 val = glm::ivec1(0);
							std::memcpy(&val[0], &Buffer[0], ByteSize);

							if (ImGui::InputInt(Name.c_str(), &val[0]))
							{
								ValueRegistry->SetValue(Name, Type, &val[0], ByteSize);
							}
						}
						break;
						case graphics::EUniformValueType::VALUE_TYPE_FLOAT_ARRAY:
							continue;
						case graphics::EUniformValueType::VALUE_TYPE_MAT4_ARRAY:
							continue;
						default:
							break;
						}
					}
				}
			}

			ImGui::EndTabItem();
		}

		return true;
	}
}
#endif