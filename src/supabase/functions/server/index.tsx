import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to hash passwords (simple implementation)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to generate unique ID
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Patient Signup
app.post('/make-server-fb3b7dfe/signup/patient', async (c) => {
  try {
    const body = await c.req.json();
    const {
      name, age, gender, email, password, caregiverId,
      phoneNumber, healthCondition, physicianName, physicianContact,
      medications, emergencyContact, bloodGroup
    } = body;

    // Check if email already exists
    const existingUsers = await kv.getByPrefix('user:');
    const emailExists = existingUsers.some((user: any) => user.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: 'patient' },
      email_confirm: true // Automatically confirm since email server not configured
    });

    if (authError) {
      console.log('Authorization error while creating patient account:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const patientId = generateUniqueId('PAT');
    const userId = authData.user.id;

    // Store user data
    const userData = {
      id: userId,
      patientId,
      type: 'patient',
      name,
      age,
      gender,
      email,
      phoneNumber,
      healthCondition,
      physicianName,
      physicianContact,
      medications,
      emergencyContact,
      bloodGroup,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, userData);
    await kv.set(`patient:${patientId}`, { userId, patientId });

    // Link to caregiver if caregiverId provided
    if (caregiverId) {
      const caregivers = await kv.getByPrefix('caregiver:');
      const caregiver = caregivers.find((cg: any) => cg.caregiverId === caregiverId);
      
      if (caregiver) {
        await kv.set(`link:patient:${patientId}`, { patientId, caregiverIds: [caregiverId] });
        
        // Update caregiver's patient list
        const cgLinks = await kv.get(`link:caregiver:${caregiverId}`) || { caregiverId, patientIds: [] };
        cgLinks.patientIds.push(patientId);
        await kv.set(`link:caregiver:${caregiverId}`, cgLinks);
      }
    }

    return c.json({ success: true, patientId, userId });
  } catch (error) {
    console.log('Error during patient signup:', error);
    return c.json({ error: 'Internal server error during patient signup' }, 500);
  }
});

// Caregiver Signup
app.post('/make-server-fb3b7dfe/signup/caregiver', async (c) => {
  try {
    const body = await c.req.json();
    const {
      name, relationship, age, email, phoneNumber, password, patientId
    } = body;

    // Check if email already exists
    const existingUsers = await kv.getByPrefix('user:');
    const emailExists = existingUsers.some((user: any) => user.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    // Verify patient exists
    const patients = await kv.getByPrefix('patient:');
    const patientExists = patients.some((p: any) => p.patientId === patientId);
    
    if (!patientExists) {
      return c.json({ error: 'Invalid patient ID' }, 400);
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType: 'caregiver' },
      email_confirm: true
    });

    if (authError) {
      console.log('Authorization error while creating caregiver account:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const caregiverId = generateUniqueId('CG');
    const userId = authData.user.id;

    // Store user data
    const userData = {
      id: userId,
      caregiverId,
      type: 'caregiver',
      name,
      relationship,
      age,
      email,
      phoneNumber,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, userData);
    await kv.set(`caregiver:${caregiverId}`, { userId, caregiverId });

    // Link to patient
    const patientLinks = await kv.get(`link:patient:${patientId}`) || { patientId, caregiverIds: [] };
    
    // Check if already has 4 caregivers
    if (patientLinks.caregiverIds.length >= 4) {
      return c.json({ error: 'Patient already has maximum of 4 caregivers' }, 400);
    }
    
    patientLinks.caregiverIds.push(caregiverId);
    await kv.set(`link:patient:${patientId}`, patientLinks);

    // Store caregiver's patient link
    const cgLinks = await kv.get(`link:caregiver:${caregiverId}`) || { caregiverId, patientIds: [] };
    cgLinks.patientIds.push(patientId);
    await kv.set(`link:caregiver:${caregiverId}`, cgLinks);

    return c.json({ success: true, caregiverId, userId });
  } catch (error) {
    console.log('Error during caregiver signup:', error);
    return c.json({ error: 'Internal server error during caregiver signup' }, 500);
  }
});

// Get user data
app.get('/make-server-fb3b7dfe/user', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while getting user data:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log('Error getting user data:', error);
    return c.json({ error: 'Internal server error while getting user data' }, 500);
  }
});

// Daily Routines - Create/Update
app.post('/make-server-fb3b7dfe/routines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { taskName, time, details, snoozeTime } = body;

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const routines = await kv.get(`routines:${patientId}`) || { patientId, tasks: [] };
    
    routines.tasks.push({
      id: generateUniqueId('TASK'),
      taskName,
      time,
      details,
      snoozeTime,
      completed: false,
      createdAt: new Date().toISOString()
    });

    await kv.set(`routines:${patientId}`, routines);

    return c.json({ success: true, routines });
  } catch (error) {
    console.log('Error creating routine:', error);
    return c.json({ error: 'Internal server error while creating routine' }, 500);
  }
});

// Get Routines
app.get('/make-server-fb3b7dfe/routines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId || userData.type === 'caregiver' ? c.req.query('patientId') : null;

    if (!patientId) {
      return c.json({ error: 'Patient ID required' }, 400);
    }

    const routines = await kv.get(`routines:${patientId}`) || { patientId, tasks: [] };

    return c.json({ success: true, routines });
  } catch (error) {
    console.log('Error getting routines:', error);
    return c.json({ error: 'Internal server error while getting routines' }, 500);
  }
});

// Update Routine Task
app.put('/make-server-fb3b7dfe/routines/:taskId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('taskId');
    const body = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const routines = await kv.get(`routines:${patientId}`);
    
    if (!routines) {
      return c.json({ error: 'Routines not found' }, 404);
    }

    const taskIndex = routines.tasks.findIndex((t: any) => t.id === taskId);
    
    if (taskIndex === -1) {
      return c.json({ error: 'Task not found' }, 404);
    }

    routines.tasks[taskIndex] = { ...routines.tasks[taskIndex], ...body };
    await kv.set(`routines:${patientId}`, routines);

    return c.json({ success: true, routines });
  } catch (error) {
    console.log('Error updating routine task:', error);
    return c.json({ error: 'Internal server error while updating routine' }, 500);
  }
});

// Delete Routine Task
app.delete('/make-server-fb3b7dfe/routines/:taskId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('taskId');

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const routines = await kv.get(`routines:${patientId}`);
    
    if (!routines) {
      return c.json({ error: 'Routines not found' }, 404);
    }

    routines.tasks = routines.tasks.filter((t: any) => t.id !== taskId);
    await kv.set(`routines:${patientId}`, routines);

    return c.json({ success: true, routines });
  } catch (error) {
    console.log('Error deleting routine task:', error);
    return c.json({ error: 'Internal server error while deleting routine' }, 500);
  }
});

// Memory Book - Create Entry
app.post('/make-server-fb3b7dfe/memory-book', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, relationship, image, story } = body;

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const memoryBook = await kv.get(`memory:${patientId}`) || { patientId, entries: [] };
    
    memoryBook.entries.push({
      id: generateUniqueId('MEM'),
      name,
      relationship,
      image,
      story,
      createdAt: new Date().toISOString()
    });

    await kv.set(`memory:${patientId}`, memoryBook);

    return c.json({ success: true, memoryBook });
  } catch (error) {
    console.log('Error creating memory book entry:', error);
    return c.json({ error: 'Internal server error while creating memory' }, 500);
  }
});

// Get Memory Book
app.get('/make-server-fb3b7dfe/memory-book', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const memoryBook = await kv.get(`memory:${patientId}`) || { patientId, entries: [] };

    return c.json({ success: true, memoryBook });
  } catch (error) {
    console.log('Error getting memory book:', error);
    return c.json({ error: 'Internal server error while getting memory book' }, 500);
  }
});

// Update Memory Entry
app.put('/make-server-fb3b7dfe/memory-book/:entryId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entryId = c.req.param('entryId');
    const body = await c.req.json();

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const memoryBook = await kv.get(`memory:${patientId}`);
    
    if (!memoryBook) {
      return c.json({ error: 'Memory book not found' }, 404);
    }

    const entryIndex = memoryBook.entries.findIndex((e: any) => e.id === entryId);
    
    if (entryIndex === -1) {
      return c.json({ error: 'Entry not found' }, 404);
    }

    memoryBook.entries[entryIndex] = { ...memoryBook.entries[entryIndex], ...body };
    await kv.set(`memory:${patientId}`, memoryBook);

    return c.json({ success: true, memoryBook });
  } catch (error) {
    console.log('Error updating memory entry:', error);
    return c.json({ error: 'Internal server error while updating memory' }, 500);
  }
});

// Delete Memory Entry
app.delete('/make-server-fb3b7dfe/memory-book/:entryId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entryId = c.req.param('entryId');

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const memoryBook = await kv.get(`memory:${patientId}`);
    
    if (!memoryBook) {
      return c.json({ error: 'Memory book not found' }, 404);
    }

    memoryBook.entries = memoryBook.entries.filter((e: any) => e.id !== entryId);
    await kv.set(`memory:${patientId}`, memoryBook);

    return c.json({ success: true, memoryBook });
  } catch (error) {
    console.log('Error deleting memory entry:', error);
    return c.json({ error: 'Internal server error while deleting memory' }, 500);
  }
});

// Journal - Create Entry
app.post('/make-server-fb3b7dfe/journal', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { content } = body;

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const journal = await kv.get(`journal:${patientId}`) || { patientId, entries: [] };
    
    journal.entries.push({
      id: generateUniqueId('JOUR'),
      content,
      createdAt: new Date().toISOString()
    });

    await kv.set(`journal:${patientId}`, journal);

    return c.json({ success: true, journal });
  } catch (error) {
    console.log('Error creating journal entry:', error);
    return c.json({ error: 'Internal server error while creating journal entry' }, 500);
  }
});

// Get Journal
app.get('/make-server-fb3b7dfe/journal', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId || c.req.query('patientId');

    const journal = await kv.get(`journal:${patientId}`) || { patientId, entries: [] };

    return c.json({ success: true, journal });
  } catch (error) {
    console.log('Error getting journal:', error);
    return c.json({ error: 'Internal server error while getting journal' }, 500);
  }
});

// Mood Tracker - Create Entry
app.post('/make-server-fb3b7dfe/mood', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { mood, source, notes } = body;

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const moodTracker = await kv.get(`mood:${patientId}`) || { patientId, entries: [] };
    
    const moodEntry = {
      id: generateUniqueId('MOOD'),
      mood,
      source, // 'manual', 'chat', 'journal', 'voice'
      notes,
      timestamp: new Date().toISOString()
    };

    moodTracker.entries.push(moodEntry);
    await kv.set(`mood:${patientId}`, moodTracker);

    // Check for abnormal patterns and alert caregivers
    const shouldAlert = checkMoodAlert(moodTracker.entries);
    
    if (shouldAlert) {
      // Store alert for caregivers
      const patientLinks = await kv.get(`link:patient:${patientId}`);
      if (patientLinks && patientLinks.caregiverIds) {
        for (const cgId of patientLinks.caregiverIds) {
          const alerts = await kv.get(`alerts:${cgId}`) || { caregiverId: cgId, alerts: [] };
          alerts.alerts.push({
            id: generateUniqueId('ALERT'),
            patientId,
            type: 'mood',
            message: 'Unusual mood pattern detected',
            timestamp: new Date().toISOString()
          });
          await kv.set(`alerts:${cgId}`, alerts);
        }
      }
    }

    return c.json({ success: true, moodTracker });
  } catch (error) {
    console.log('Error creating mood entry:', error);
    return c.json({ error: 'Internal server error while creating mood entry' }, 500);
  }
});

// Helper function to check mood alerts
function checkMoodAlert(entries: any[]): boolean {
  if (entries.length < 3) return false;
  
  const recentEntries = entries.slice(-5);
  const negativeMoods = ['sad', 'anxious', 'confused', 'angry', 'worried'];
  const negativeCount = recentEntries.filter(e => negativeMoods.includes(e.mood.toLowerCase())).length;
  
  return negativeCount >= 3;
}

// Get Mood Tracker
app.get('/make-server-fb3b7dfe/mood', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId || c.req.query('patientId');

    const moodTracker = await kv.get(`mood:${patientId}`) || { patientId, entries: [] };

    return c.json({ success: true, moodTracker });
  } catch (error) {
    console.log('Error getting mood tracker:', error);
    return c.json({ error: 'Internal server error while getting mood tracker' }, 500);
  }
});

// Location Sharing - Update
app.post('/make-server-fb3b7dfe/location', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { latitude, longitude, enabled } = body;

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId;

    const locationData = {
      patientId,
      latitude,
      longitude,
      enabled,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`location:${patientId}`, locationData);

    return c.json({ success: true, location: locationData });
  } catch (error) {
    console.log('Error updating location:', error);
    return c.json({ error: 'Internal server error while updating location' }, 500);
  }
});

// Get Location
app.get('/make-server-fb3b7dfe/location/:patientId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const patientId = c.req.param('patientId');
    const userData = await kv.get(`user:${user.id}`);

    // Verify caregiver has access to this patient
    if (userData.type === 'caregiver') {
      const cgLinks = await kv.get(`link:caregiver:${userData.caregiverId}`);
      if (!cgLinks || !cgLinks.patientIds.includes(patientId)) {
        return c.json({ error: 'Access denied' }, 403);
      }
    }

    const locationData = await kv.get(`location:${patientId}`);

    if (!locationData || !locationData.enabled) {
      return c.json({ error: 'Location sharing not enabled' }, 404);
    }

    return c.json({ success: true, location: locationData });
  } catch (error) {
    console.log('Error getting location:', error);
    return c.json({ error: 'Internal server error while getting location' }, 500);
  }
});

// Caregiver Dashboard
app.get('/make-server-fb3b7dfe/caregiver/dashboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    
    if (userData.type !== 'caregiver') {
      return c.json({ error: 'Access denied - caregiver only' }, 403);
    }

    const cgLinks = await kv.get(`link:caregiver:${userData.caregiverId}`);
    
    if (!cgLinks || !cgLinks.patientIds || cgLinks.patientIds.length === 0) {
      return c.json({ success: true, patients: [] });
    }

    // Get data for all linked patients
    const patientsData = [];
    
    for (const patientId of cgLinks.patientIds) {
      const patient = await kv.getByPrefix('user:');
      const patientInfo = patient.find((p: any) => p.patientId === patientId);
      
      if (patientInfo) {
        const routines = await kv.get(`routines:${patientId}`) || { tasks: [] };
        const mood = await kv.get(`mood:${patientId}`) || { entries: [] };
        const location = await kv.get(`location:${patientId}`) || null;
        
        patientsData.push({
          patientInfo,
          routines: routines.tasks,
          recentMood: mood.entries.slice(-10),
          location
        });
      }
    }

    // Get alerts
    const alerts = await kv.get(`alerts:${userData.caregiverId}`) || { alerts: [] };

    return c.json({ success: true, patients: patientsData, alerts: alerts.alerts });
  } catch (error) {
    console.log('Error getting caregiver dashboard:', error);
    return c.json({ error: 'Internal server error while getting dashboard' }, 500);
  }
});

// Get Health Info
app.get('/make-server-fb3b7dfe/health-info', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    const patientId = userData.patientId || c.req.query('patientId');

    if (!patientId) {
      return c.json({ error: 'Patient ID required' }, 400);
    }

    // If caregiver, verify access
    if (userData.type === 'caregiver') {
      const cgLinks = await kv.get(`link:caregiver:${userData.caregiverId}`);
      if (!cgLinks || !cgLinks.patientIds.includes(patientId)) {
        return c.json({ error: 'Access denied' }, 403);
      }
    }

    // Get patient user data
    const allUsers = await kv.getByPrefix('user:');
    const patientData = allUsers.find((u: any) => u.patientId === patientId);

    if (!patientData) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    const healthInfo = {
      personalInfo: {
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup
      },
      medicalInfo: {
        healthCondition: patientData.healthCondition,
        medications: patientData.medications,
        physicianName: patientData.physicianName,
        physicianContact: patientData.physicianContact
      },
      emergencyContacts: {
        emergency: patientData.emergencyContact,
        phoneNumber: patientData.phoneNumber
      },
      ids: {
        patientId: patientData.patientId
      }
    };

    // Get caregiver info
    const patientLinks = await kv.get(`link:patient:${patientId}`);
    if (patientLinks && patientLinks.caregiverIds) {
      const caregivers = [];
      for (const cgId of patientLinks.caregiverIds) {
        const cg = allUsers.find((u: any) => u.caregiverId === cgId);
        if (cg) {
          caregivers.push({
            caregiverId: cg.caregiverId,
            name: cg.name,
            relationship: cg.relationship,
            phoneNumber: cg.phoneNumber
          });
        }
      }
      healthInfo.emergencyContacts.caregivers = caregivers;
    }

    return c.json({ success: true, healthInfo });
  } catch (error) {
    console.log('Error getting health info:', error);
    return c.json({ error: 'Internal server error while getting health info' }, 500);
  }
});

Deno.serve(app.fetch);
