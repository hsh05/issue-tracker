const express = require('express');
const app = express();
let issues = [
  {
    _id: '1',
    issue_title: 'Initial Title',
    issue_text: 'Initial Text',
    created_by: 'Initial Author',
    assigned_to: 'Initial Assignee',
    status_text: 'Initial Status',
    created_on: new Date(),
    updated_on: new Date(),
    open: true
  }
]; // Store issues in memory for this example

app.use(express.json()); // Middleware to parse JSON request body

// GET request to retrieve filtered issues
app.get('/api/issues/:project', (req, res) => {
  const { project } = req.params;
  const filteredIssues = issues.filter(issue => issue.project === project)
    .filter(issue => {
      return Object.keys(req.query).every(key => {
        if (key === '_id') {
          return issue[key] === req.query[key];
        } else {
          return String(issue[key]).toLowerCase() === req.query[key].toLowerCase();
        }
      });
    });

  res.json(filteredIssues);
});

// POST request to create a new issue
app.post('/api/issues/:project', (req, res) => {
  const { project } = req.params;
  const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }

  const newIssue = {
    _id: String(issues.length + 1),
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
    project,
    created_on: new Date(),
    updated_on: new Date(),
    open: true
  };

  issues.push(newIssue);
  res.json(newIssue);
});

// PUT request to update an issue
app.put('/api/issues/:project', (req, res) => {
  const { project } = req.params;
  const { _id, ...updateFields } = req.body;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  if (Object.keys(updateFields).length === 0) {
    return res.json({ error: 'no update field(s) sent', '_id': _id });
  }

  const issueToUpdate = issues.find(issue => issue._id === _id);

  if (!issueToUpdate) {
    return res.json({ error: 'could not update', '_id': _id });
  }

  Object.assign(issueToUpdate, updateFields, { updated_on: new Date() });

  res.json({  result: 'successfully updated', '_id': _id });
});

// DELETE request to delete an issue
app.delete('/api/issues/:project', (req, res) => {
  const { project } = req.params;
  const { _id } = req.body;

  if (!_id) {
    return res.json({ error: 'missing _id' });
  }

  const indexToDelete = issues.findIndex(issue => issue._id === _id);

  if (indexToDelete === -1) {
    return res.json({ error: 'could not delete', '_id': _id });
  }

  issues.splice(indexToDelete, 1);

  res.json({ result: 'successfully deleted', '_id': _id });
});

module.exports = app;
