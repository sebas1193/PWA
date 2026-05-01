// Lovable authentication integration
// Uses @lovable.dev/cloud-auth-js package

import { createLovableAuth } from "@lovable.dev/cloud-auth-js";

export const lovable = {
  auth: createLovableAuth(),
};
