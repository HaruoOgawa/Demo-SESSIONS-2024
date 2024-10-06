#include "CSDFRenderer.h"
#include <Debug/Message/Console.h>

namespace component
{
	CSDFRenderer::CSDFRenderer(const std::string& ComponentName, const std::string& RegistryName) :
		CComponent(ComponentName, RegistryName)
	{
		Console::Log("[CPP] CSDFRenderer::CSDFRenderer\n");
	}

	CSDFRenderer::~CSDFRenderer()
	{
	}

	void CSDFRenderer::OnLoaded(const std::shared_ptr<scene::CSceneController>& SceneController, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode)
	{
		Console::Log("[CPP] CSDFRenderer::OnLoaded\n");
	}

	bool CSDFRenderer::Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState)
	{
		Console::Log("[CPP] CSDFRenderer::Update\n");

		return true;
	}

	bool CSDFRenderer::Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
		const std::shared_ptr<graphics::CDrawInfo>& DrawInfo)
	{
		Console::Log("[CPP] CSDFRenderer::Draw\n");

		return true;
	}
}