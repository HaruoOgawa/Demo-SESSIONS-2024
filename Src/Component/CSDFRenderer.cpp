#include "CSDFRenderer.h"
#include <Object/C3DObject.h>
#include <Scene/CSceneController.h>

namespace component
{
	CSDFRenderer::CSDFRenderer(const std::string& ComponentName, const std::string& RegistryName) :
		CComponent(ComponentName, RegistryName),
		m_Mesh(nullptr),
		m_Material(nullptr),
        m_TextIndex(0.0f)
	{
	}

	CSDFRenderer::~CSDFRenderer()
	{
	}

	bool CSDFRenderer::OnLoaded(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<scene::CSceneController>& SceneController,
		const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode)
	{
        //
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
        } };

        const auto it = sdf_chars.find(SelfNode->GetName());
        if (it != sdf_chars.end())
        {
            m_TextIndex = static_cast<float>(it->second);
        }

		// CreateInfo
		std::pair<std::shared_ptr<graphics::CVertexBuffer>, std::shared_ptr<graphics::CIndexBuffer>> createInfo;
		createInfo = graphics::CPresetPrimitive::CreateBoard(pGraphicsAPI);

		graphics::EPresetPrimitiveType PrimitiveType = graphics::EPresetPrimitiveType::BOARD;

        std::vector<std::shared_ptr<graphics::CMaterial>> MaterialList;

        // m_Material
        {
            const auto& MaterialFrameMap = SceneController->GetMaterialFrameMap();
            const auto matIT = MaterialFrameMap.find("sdftext_mf");
            if (matIT == MaterialFrameMap.end()) return false;

            m_Material = matIT->second->CreateMaterial(pGraphicsAPI, 1, graphics::ECullMode::CULL_NONE);

            m_Material->ReplaceTextureIndex("MainTexture", 0);
            m_Material->SetUniformValue("maxWidth", &glm::vec1(1184.0f)[0], sizeof(float));
            m_Material->SetUniformValue("charWidth", &glm::vec1(32.0f)[0], sizeof(float));
            m_Material->SetUniformValue("numOfChar", &glm::vec1(37.0f)[0], sizeof(float));
            m_Material->SetUniformValue("textID", &glm::vec1(m_TextIndex)[0], sizeof(float));

            if (!m_Material->Create(Object->GetTextureSet())) return false;

            MaterialList.push_back(m_Material);
        }

		// Mesh
        {
            m_Mesh = std::make_shared<graphics::CMesh>();
            m_Mesh->CreatePresetSimpleMesh(createInfo.first, createInfo.second, 0, PrimitiveType);

            // Create Mesh
            if (!m_Mesh->Create(pGraphicsAPI, MaterialList, Object->GetPassName(), Object->GetDepthPassName())) return false;
        }

        return true;
	}

	bool CSDFRenderer::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		return true;
	}

	bool CSDFRenderer::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode)
	{
		if (!m_Mesh || !m_Material) return true;

		for (const auto& Primitive : m_Mesh->GetPrimitiveList())
		{
			const auto& WorldMatrix = Object->GetObjectTransform()->GetModelMatrix() * SelfNode->GetWorldMatrix();

			// 共通のユニフォームバッファの更新
			glm::mat4 lightVPMat = DrawInfo->GetLightProjection()->GetPrejectionMatrix() * DrawInfo->GetLightCamera()->GetViewMatrix();

			m_Material->SetUniformValue("model", &WorldMatrix[0][0], sizeof(glm::mat4));
			m_Material->SetUniformValue("view", &Camera->GetViewMatrix()[0][0], sizeof(glm::mat4));
			m_Material->SetUniformValue("proj", &Projection->GetPrejectionMatrix()[0][0], sizeof(glm::mat4));
			m_Material->SetUniformValue("lightVPMat", &lightVPMat[0][0], sizeof(glm::mat4));

			// 描画実行
			if (!Primitive->Draw(m_Material, 1, false)) return false;
		}

		return true;
	}
}