import {
  DEFAULT_USER_LABEL_CONFIG,
  UserLabelConfig,
} from "@/lib/utils/userLabelConfig";
import {
  deleteUserLabelConfig,
  loadUserLabelConfig,
  saveUserLabelConfig,
} from "@/lib/utils/userLabelConfigServer";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET": {
      try {
        const config = loadUserLabelConfig();
        return res.status(200).json(config);
      } catch (error) {
        console.error("[userlabels/config] GET error:", error);
        return res.status(500).json({ error: String(error) });
      }
    }

    case "POST": {
      try {
        const config = req.body as UserLabelConfig;
        if (
          !config?.grid ||
          !config?.label ||
          !Array.isArray(config?.lines) ||
          !config?.barcode
        ) {
          return res.status(400).json({ error: "Invalid config structure" });
        }
        saveUserLabelConfig(config);
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("[userlabels/config] POST error:", error);
        return res.status(500).json({ error: String(error) });
      }
    }

    case "DELETE": {
      try {
        deleteUserLabelConfig();
        return res.status(200).json({ success: true, config: DEFAULT_USER_LABEL_CONFIG });
      } catch (error) {
        console.error("[userlabels/config] DELETE error:", error);
        return res.status(500).json({ error: String(error) });
      }
    }

    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
}
