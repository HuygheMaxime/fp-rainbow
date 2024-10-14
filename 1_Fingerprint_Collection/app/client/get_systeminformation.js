const si = require('systeminformation');
const crypto = require('crypto');

function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function getSystemInformation(uuid, client) {
  const staticInfo = await si.getStaticData();
  const dynamicInfo = await si.getDynamicData();
  const staticInfoString = JSON.stringify(staticInfo);
  const dynamicInfoString = JSON.stringify(dynamicInfo);
  const staticId = generateHash(staticInfoString);
  const dynamicId = generateHash(dynamicInfoString);
  var runtimeconfig_uuid = uuid;
  await client.query(`
      INSERT INTO systeminformation_static (id, json_si) VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING;
    `, [staticId, staticInfo]);
  await client.query(`
      INSERT INTO systeminformation_dynamic (id, json_si) VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING;
    `, [dynamicId, dynamicInfo]);
  await client.query(`
      INSERT INTO runtimeconfig_systeminformation (runtimeconfig_uuid, systeminformation_static_id, systeminformation_dynamic_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING;
    `, [runtimeconfig_uuid, staticId, dynamicId]);
}

module.exports = getSystemInformation; 


