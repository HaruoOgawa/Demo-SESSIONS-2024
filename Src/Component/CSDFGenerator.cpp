#ifdef _DEBUG
#include "CSDFGenerator.h"
#include <Debug/Message/Console.h>
#include <Object/C3DObject.h>

#include "CSDFRenderer.h"

namespace component
{
	CSDFGenerator::CSDFGenerator(const std::string& ComponentName, const std::string& RegistryName):
		CComponent(ComponentName, RegistryName)
	{
	}

	CSDFGenerator::~CSDFGenerator()
	{
	}

	void CSDFGenerator::OnLoaded(const std::shared_ptr<scene::CSceneController>& SceneController, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode)
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
        } };

        for (const auto& Node : Object->GetNodeList())
        {
            const auto it = sdf_chars.find(Node->GetName());
            if (it == sdf_chars.end()) continue;

            bool isFound = false;
            for (const auto& Component : Node->GetComponentList())
            {
                if (Component->GetComponentName() == "SDFRenderer")
                {
                    isFound = true;
                    break;
                }
            }

            // 見つかったのでスキップ
            if (isFound) continue;

            // 新しくコンポーネントを追加
            auto NewComponent = std::make_shared<component::CSDFRenderer>("SDFRenderer", "");
            Node->AddComponent(NewComponent);
        }
	}
}
#endif // _DEBUG