#pragma once

// Screen Space Water

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
	class CSSWater
	{
		std::string m_TargetPassName;

		std::shared_ptr<graphics::CFrameRenderer> m_SSWaterFrameRenderer;
		std::shared_ptr<graphics::CFrameRenderer> m_ResultRenderer;
	public:
		CSSWater(const std::string& TargetPassName);
		virtual ~CSSWater();

		bool Initialize(api::IGraphicsAPI* pGraphicsAPI, resource::CLoadWorker* pLoadWorker, const std::tuple<std::string, int>& DepthGBufferTuple,
			const std::tuple<std::string, int>& PosGBufferTuple, const std::tuple<std::string, int>& NormalGBufferTuple, const std::tuple<std::string, int>& MetallicRoughnessGBufferTuple);

		bool Update(api::IGraphicsAPI* pGraphicsAPI, physics::IPhysicsEngine* pPhysicsEngine, resource::CLoadWorker* pLoadWorker, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo, const std::shared_ptr<input::CInputState>& InputState);

		bool Draw(api::IGraphicsAPI* pGraphicsAPI, const std::shared_ptr<camera::CCamera>& Camera, const std::shared_ptr<projection::CProjection>& Projection,
			const std::shared_ptr<graphics::CDrawInfo>& DrawInfo);
	};
}