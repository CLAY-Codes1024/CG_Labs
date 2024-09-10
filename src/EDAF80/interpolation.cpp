#include "interpolation.hpp"

glm::vec3
interpolation::evalLERP(glm::vec3 const& p0, glm::vec3 const& p1, float const x)
{
	//! \todo Implement this function
	return (1.0f - x) * p0 + x * p1;
}

glm::vec3
interpolation::evalCatmullRom(glm::vec3 const& p0, glm::vec3 const& p1,
                              glm::vec3 const& p2, glm::vec3 const& p3,
                              float const t, float const x)
{
	//! \todo Implement this function
	// Bear in mind that matrix in glm is column basic
	glm::vec3 interpolated_pos = glm::vec4(1, x, x * x, x * x * x) *
		glm::mat4(0, -t, 2 * t, -t,
			1, 0, t - 3, 2 - t,
			0, t, 3 - 2 * t, t - 2,
			0, 0, -t, t) *
		// 4 colmuns and 3 rows, but mathematical matrix is row based
		glm::transpose(glm::mat4x3(p0, p1, p2, p3));
	return interpolated_pos;
}
