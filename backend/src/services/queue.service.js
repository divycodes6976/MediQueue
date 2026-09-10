const { publisher } = require("../config/redis");
const { query } = require("../config/db");

const QUEUE_UPDATED_CHANNEL = "QUEUE_UPDATED";


/// department parameter lo
// us department ki updated queue nikalo 
// publis mesage on channel with department and updated queue
async function notifyQueueUpdate(department) {
  const normalizedDepartment = department.trim().toUpperCase();

  try{
    const updatedQueue=await getQueue(normalizedDepartment);
    await publisher.publish(QUEUE_UPDATED_CHANNEL, JSON.stringify({
        department: normalizedDepartment,
        queue: updatedQueue
    }));


  }catch (err) {
    console.error("Error notifying queue update:", err);

  }
}

// select all token and add patient info in it whose status is waiting in that department
const getQueue = async (department) => {
    const normalizedDepartment = department.trim().toUpperCase();
    const rows= await query(`
        select 
        t.id,
        t.token_number as "tokenNumber",
        t.patient_id as "patientId",
        t.department,
        t.status,
        t.priority,
        t.created_at as "createdAt",
        p.name as "patientName",
        p.age as "patientAge",
        p.phone as "patientPhone"
        from tokens t 
        left join patients p
        on t.patient_id = p.id
        where t.department = $1 and t.status='waiting'
        `
        ,
        [normalizedDepartment]
      
 )
    return sortWaitingQueue(rows);
};

const PRIORITY_ORDER = {
    EMERGENCY: 3,
    SENIOR: 2,
    NORMAL: 1,
};

function sortWaitingQueue(rows) {
    return [...rows].sort((a, b) => {
        if (PRIORITY_ORDER[b.priority] !== PRIORITY_ORDER[a.priority]) {
            return (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

// Get all waiting tokens across all departments and adding the patient information to each token
const getAllWaiting = async () => {
  const waitingTokens = await query(
    `
      SELECT
        t.id,
        t.token_number AS "tokenNumber",
        t.patient_id AS "patientId",
        t.department,
        t.status,
        t.priority,
        t.created_at AS "createdAt",
        p.name AS "patientName",
        p.age AS "patientAge",
        p.phone AS "patientPhone"
      FROM tokens t
      LEFT JOIN patients p ON t.patient_id = p.id
      WHERE t.status = $1
    `,
    ["waiting"]
  );

  return sortWaitingQueue(waitingTokens);
};

//doctor call next dabyega 
// get queue se first token take
// update the stats to in progress
// notify queue
// return first token

const callNext = async (department) => {
  const queue = await getQueue(department);

  if (queue.length === 0) return null;

  const firstToken = queue[0];

  const updated = await query(
    `UPDATE tokens SET status = $1 WHERE id = $2 RETURNING *`,
    ["IN_PROGRESS", firstToken.id]
  );

  if (updated.length === 0) return null;

  await notifyQueueUpdate(department);
  return updated[0];
};

// Complete a token by updating its status
const completeToken = async (tokenId, action) => {
  const updatedToken = await query(
    `UPDATE tokens
     SET status = $2
     WHERE id = $1
     RETURNING id, department`,
    [tokenId, action]
  );

  if (updatedToken.length === 0) {
    return null;
  }

  await notifyQueueUpdate(updatedToken[0].department);
  return { tokenId, status: action };
};

module.exports = {
  callNext,
  getQueue,
  getAllWaiting,
  completeToken,
  notifyQueueUpdate,
};
