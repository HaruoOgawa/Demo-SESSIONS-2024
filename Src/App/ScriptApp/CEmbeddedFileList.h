
#pragma once

#include <vector>
#include <string>

namespace resource
{
	class CEmbeddedFileList
	{
            public:
                static std::vector<unsigned char> GetBinary(const std::string& Key);
	};
}
    