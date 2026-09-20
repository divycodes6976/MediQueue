const { withTransaction } = require("../../config/db");
const { createToken } = require("../../services/token.service");
const { notifyQueueUpdate } = require("../../services/queue.service");
const { createPatient } = require("../../services/patient.service");

// parameter lo
// validation karo
// patient create karo with the help of services
// token create karo with the help of services
// queue update notify karo with the help of services

const registerPatientFlow = async (name, age, phone, department, priority, chiefComplaint) => {
    const normalizedName = name.trim();
    const normalizedAge = Number(age);
    const normalizedPhone = phone.trim();
    const normalizedDepartment = department.trim().toUpperCase();
    const normalizedPriority = priority.trim().toUpperCase();
    const normalizedComplaint = chiefComplaint?.trim() ?? "";

    if (!normalizedName || Number.isNaN(normalizedAge) || normalizedAge <= 0 || !normalizedPhone) {
        throw new Error("Invalid patient data. Name, valid age, and phone are required.");
    }
    if (!normalizedComplaint) {
        throw new Error("Patient problem / chief complaint is required.");
    }
    if (!normalizedDepartment) {
        throw new Error("Department is required.");
    }
    if (!normalizedPriority) {
        throw new Error("Priority is required.");
    }

    const result = await withTransaction(async (tx) => {
        const patient = await createPatient(
            { name: normalizedName, age: normalizedAge, phone: normalizedPhone },
            tx
        );
        if (!patient?.id) {
            throw new Error("Failed to create patient");
        }
        const token = await createToken(patient.id, normalizedDepartment, normalizedPriority, tx);
        return { patient, token };
    });

    await notifyQueueUpdate(normalizedDepartment);
    return result;
};

module.exports = {
    registerPatientFlow,
};  
