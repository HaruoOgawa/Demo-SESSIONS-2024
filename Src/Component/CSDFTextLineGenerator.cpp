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
        float Width = -20.0f;

        // std::vector��push_back���鎞�A�e�ʂ𒴂���v�f���ǉ����ꂽ�����Ń������̍Ĕz�u���s���邱�Ƃ�����
        // ���̌��ʎ��O�Ƀx�N�^�[����擾���Ă������v�f�̃A�h���X�������ɂȂ���null�A�N�Z�X�ɂȂ邱�Ƃ�����(0xdddddddddddd�A�N�Z�X)
        // ������������std::vector::reserve�Ŏ��O�Ɋm�ۂ��Ă����Ƃ悢
        // ���ꂪ�悭�^�G���W���ł��̂悤�ȃR�[�h����������������
        // https://chatgpt.com/c/670855dc-3910-800d-9ebb-33f1f9c2532c
        // ��ɒǉ����ꂤ��ʂ��v�Z
        size_t AddedNum = 0;
        for (int ChildNodeIndex : ChildrenNodeIndexList)
        {
            const auto& Node = Object->GetNodeList()[ChildNodeIndex];

            // �q�v�f�����݂��Ȃ������當���̎q�v�f���쐬����
            if (!Node->GetChildrenNodeIndexList().empty()) continue;

            // �m�[�h���̒��������V�K�ǉ�����
            std::string NodeName = Node->GetName();
            AddedNum += NodeName.size();
        }

        // �x�N�^�[�T�C�Y���ė\��
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

            // ���W��Z�����蓖�Ă�
            glm::vec3 Pos = Node->GetPos();
            Pos.z = Width * LineIndex;

            Node->SetPos(Pos);

            // �X�V
            LineIndex++;

            // �q�v�f�����݂��Ȃ������當���̎q�v�f���쐬����
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

                // �q�v�f��ǉ�
                Node->AddChildrenNodeIndex(SelfNodeIndex);
            }
		}

		return true;
	}
}
#endif