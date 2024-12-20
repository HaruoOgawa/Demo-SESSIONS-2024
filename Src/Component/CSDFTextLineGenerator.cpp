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

        const auto& ChildrenNodeIndexList = SelfNode->GetChildrenNodeIndexList();

        float LineIndex = 0.0f;
        //float Width = -20.0f;
        float Width = -10.0f; // // 2列にする

        // std::vectorにpush_backする時、容量を超える要素が追加された内部でメモリの再配置が行われることがある
        // その結果事前にベクターから取得しておいた要素のアドレスが無効になってnullアクセスになることがある(0xddddddddddddアクセス)
        // そういう時はstd::vector::reserveで事前に確保しておくとよい
        // これがよく某エンジンでそのようなコードがあった原因かぁ
        // https://chatgpt.com/c/670855dc-3910-800d-9ebb-33f1f9c2532c
        // 先に追加されうる量を計算
        size_t AddedNum = 0;
        for (int ChildNodeIndex : ChildrenNodeIndexList)
        {
            const auto& Node = Object->GetNodeList()[ChildNodeIndex];

            // 子要素が存在しなかったら文字の子要素を作成する
            if (!Node->GetChildrenNodeIndexList().empty()) continue;

            // ノード名の長さだけ新規追加する
            std::string NodeName = Node->GetName();
            AddedNum += NodeName.size();
        }

        // ベクターサイズを再予約
        if (AddedNum > 0)
        {
            Object->ReserveNodeCount(Object->GetNodeList().size() + AddedNum);
        }

        //
        const auto& NodeList = Object->GetNodeList();
        for (int ChildNodeIndex : ChildrenNodeIndexList)
		{
			const auto& Node = NodeList[ChildNodeIndex];
            std::string NodeName = Node->GetName();

			Console::Log("NodeName: %s\n", NodeName.c_str());

            // 座標のZを割り当てる
            glm::vec3 Pos = Node->GetPos();
            Pos.z = Width * LineIndex;

            // 2列にする時のX
            {
                Pos.x = ((static_cast<int>(LineIndex) % 2 == 0) ? 1.0f : -1.0f) * 5.0f - static_cast<float>(Node->GetChildrenNodeIndexList().size()) * 0.5f;
            }

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

                glm::vec3 NewCharPos = NewCharNode->GetPos();
                NewCharPos.x = static_cast<float>(i) * 1.0f;
                NewCharNode->SetPos(NewCharPos);

                Object->AddNode(NewCharNode);

                // 子要素を追加
                Node->AddChildrenNodeIndex(SelfNodeIndex);
            }
		}

		return true;
	}
}
#endif