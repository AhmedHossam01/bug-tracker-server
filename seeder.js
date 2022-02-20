const { faker } = require("@faker-js/faker");
const fs = require("fs");

console.log("############");

const projects = [];
const tickets = [];

const genFakeProject = () => ({
  id: faker.datatype.uuid(),
  name: faker.hacker.adjective() + " " + faker.hacker.noun(),
  color: faker.internet.color(),
  description: faker.lorem.paragraph(),
  created_at: faker.date.past(),
  updated_at: faker.date.past(),
});

for (let i = 0; i < 4; i++) {
  projects.push(genFakeProject());
}

const projectIds = projects.map((project) => project.id);

const genFakeTickets = () => ({
  id: faker.datatype.uuid(),
  name: faker.git.commitMessage(),
  description: faker.hacker.phrase(),
  assignee: faker.image.avatar(),
  projectId: faker.random.arrayElement(projectIds),
  status: faker.random.arrayElement(["todo", "doing", "done"]),
  tags: [faker.random.arrayElement(["bug", "feature", "enhancement"])],
  created_at: faker.date.recent(),
});

for (let i = 0; i < 30; i++) {
  tickets.push(genFakeTickets());
}

const data = {
  projects,
  tickets,
};

fs.writeFileSync(
  "./database.json",
  JSON.stringify(data),
  {
    encoding: "UTF-8",
  },
  (err, result) => {
    console.log(result);
  }
);

// faker.git.commitMessage()
// faker.hacker.phrase()
