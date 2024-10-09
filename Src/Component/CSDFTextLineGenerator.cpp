#ifdef _DEBUG
#include "CSDFTextLineGenerator.h"
#include <Object/C3DObject.h>
#include <Debug/Message/Console.h>
#include <vector>
#include <memory>

namespace component
{
	CSDFTextLineGenerator::CSDFTextLineGenerator(const std::string& ComponentName, const std::string& RegistryName) :
		CComponent(ComponentName, RegistryName)
	{
	}

	CSDFTextLineGenerator::~CSDFTextLineGenerator()
	{
	}

	bool CSDFTextLineGenerator::OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<scene::CSceneController>& SceneController,
		const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode)
	{
        std::map<std::string, int> sdf_chars = {
                {
                    "A",
                    0
                },
                {
                    "B",
                    1
                },
                {
                    "C",
                    2
                },
                {
                    "D",
                    3
                },
                {
                    "E",
                    4
                },
                {
                    "F",
                    5
                },
                {
                    "G",
                    6
                },
                {
                    "H",
                    7
                },
                {
                    "I",
                    8
                },
                {
                    "J",
                    9
                },
                {
                    "K",
                    10
                },
                {
                    "L",
                    11
                },
                {
                    "M",
                    12
                },
                {
                    "N",
                    13
                },
                {
                    "O",
                    14
                },
                {
                    "P",
                    15
                },
                {
                    "Q",
                    16
                },
                {
                    "R",
                    17
                },
                {
                    "S",
                    18
                },
                {
                    "T",
                    19
                },
                {
                    "U",
                    20
                },
                {
                    "V",
                    21
                },
                {
                    "W",
                    22
                },
                {
                    "X",
                    23
                },
                {
                    "Y",
                    24
                },
                {
                    "Z",
                    25
                },
                {
                    "0",
                    26
                },
                {
                    "1",
                    27
                },
                {
                    "2",
                    28
                },
                {
                    "3",
                    29
                },
                {
                    "4",
                    30
                },
                {
                    "5",
                    31
                },
                {
                    "6",
                    32
                },
                {
                    "7",
                    33
                },
                {
                    "8",
                    34
                },
                {
                    "9",
                    35
                },
                {
                    "_",
                    36
                }
        };

		const auto& NodeList = Object->GetNodeList();

        float LineIndex = 0.0f;
        float Width = -20.0f;

		for (int ChildNodeIndex : SelfNode->GetChildrenNodeIndexList())
		{
			const auto& Node = NodeList[ChildNodeIndex];
            std::string NodeName = Node->GetName();

			Console::Log("NodeName: %s\n", NodeName.c_str());

            // 座標のZを割り当てる
            glm::vec3 Pos = Node->GetPos();
            Pos.z = Width * LineIndex;

            Node->SetPos(Pos);

            // 更新
            LineIndex++;

            // 子要素が存在しなかったら文字の子要素を作成する
            if (!Node->GetChildrenNodeIndexList().empty()) continue;

            std::vector<char> buffer;
            buffer.resize(NodeName.size());
            std::memcpy(&buffer[0], &NodeName.data()[0], NodeName.size() * sizeof(char));

            for (int i = 0; i < static_cast<int>(buffer.size()); i++)
            {
                std::string CharName = std::string(1, buffer[i]);

                Console::Log("CharName: %s\n", CharName.c_str());

                int SelfNodeIndex = static_cast<int>(Object->GetNodeList().size());
                std::shared_ptr<object::CNode> NewCharNode = std::make_shared<object::CNode>(-1, SelfNodeIndex);
                NewCharNode->SetName(CharName);

                Object->AddNode(NewCharNode);

                // 子要素を追加
                Node->AddChildrenNodeIndex(SelfNodeIndex);
            }
		}

		return true;
	}
}
#endif