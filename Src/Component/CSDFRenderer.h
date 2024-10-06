#pragma once

#include <Scriptable/CComponent.h>

namespace component
{
	class CSDFRenderer : public scriptable::CComponent
	{
	public:
		CSDFRenderer(const std::string& ComponentName, const std::string& RegistryName);
		virtual ~CSDFRenderer();

		virtual void OnLoaded(const std::shared_ptr<scene::CSceneController>& SceneController, const std::shared_ptr<object::C3DObject>& Object, const std::shared_ptr<object::CNode>& SelfNode) override;

		virtual bool Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState) override;

		virtual bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo) override;
	};
}