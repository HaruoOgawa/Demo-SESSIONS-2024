#pragma once

#include <Scriptable/CComponent.h>

namespace component
{
	class CTestComponent : public scriptable::CComponent
	{
	public:
		CTestComponent(const std::string& ComponentName, const std::string& RegistryName);
		virtual ~CTestComponent();
	};
}