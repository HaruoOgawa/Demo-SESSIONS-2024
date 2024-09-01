#pragma once

#include <memory>
#include <vector>
#include <tuple>
#include <Interface/IGraphicsAPI.h>

namespace resource { class CLoadWorker; }
namespace camera { class CCamera; }
namespace projection { class CProjection; }
namespace input { class CInputState; }
namespace physics { class IPhysicsEngine; }
namespace graphics
{
	class CFrameRenderer;
	class CDrawInfo;
}

namespace imageeffect
{
	class CLightShaft
	{
		std::string m_TargetPassName;
		std::tuple<std::string, int> m_DepthBufferTuple;

		std::shared_ptr<graphics::CFrameRenderer> m_LightShaftFrameRenderer;
		std::shared_ptr<graphics::CFrameRenderer> m_ResultRenderer;
	public:
		CLightShaft(const std::string& TargetPassName, const std::tuple<std::string, int>& DepthBufferTuple);
		virtual ~CLightShaft();

		bool Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker);

		bool Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState);

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo);
	};
}