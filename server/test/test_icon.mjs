import {getTuyaIcon} from "./utils.mjs";
import fs from 'fs';

const id = '568217572cf432a6bd3f';
const iconURL = 'smart/icon/bay1631238927581Zvw8/4954e72b45c4f436fe31cfd113088515.png';

const iconPath = `./data/icons/${id}`;
let icon;
if (fs.existsSync(iconPath)) {
    icon = await fs.readFileSync(iconPath);
} else {
    icon = await getTuyaIcon(iconURL);
    await fs.writeFileSync(iconPath, icon);
}

console.log(icon);