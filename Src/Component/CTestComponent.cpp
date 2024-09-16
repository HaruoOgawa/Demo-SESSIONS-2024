#include "CTestComponent.h"

namespace component
{
	CTestComponent::CTestComponent(const std::string& ComponentName, const std::string& RegistryName):
		CComponent(ComponentName, RegistryName)
	{
	}

	CTestComponent::~CTestComponent()
	{
	}
}