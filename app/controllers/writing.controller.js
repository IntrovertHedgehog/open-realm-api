const db = require("../models");
const Writing = db.writings;
const Op = db.Sequelize.Op;

(prop) => {
    (a, b) =>  {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

// Create new writing
exports.create = (req, res) => {
  // Validate request
  if (!(req.body.title && req.body.content && req.body.prompt_id && req.body.author_id)) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a writing
  const writing = {
    title: req.body.title,
    author_id: req.body.author_id,
    prompt_id: req.body.prompt_id,
    content: req.body.content,
    numberOfBookmarks: 0,
    comments_id: [],
    published: req.body.published
  };

  // Save Writing in the database
  Writing.create(writing)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the Writing."
    });
  });
};

// Retrieve all writing from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  const content = req.query.content;
  const author_id = req.query.author_id;
  const prompt_id = req.query.prompt_id;
  const q = req.query.q;

  var condition = (title || content || author_id) ? {
    title: { [Op.iLike]: { [Op.any]: title ? `%${title.trim()}%`
      .replace(/ +(?= )/g,'')
      .replace(' ','% %')
      .split(' ') : ["%"]}},
    content: { [Op.iLike]: { [Op.any]: content ? `%${content.trim()}%`
      .replace(/ +(?= )/g,'')
      .replace(' ','% %')
      .split(' ') : ["%"]}},
    author_id: { [Op.like]: `${author_id ? author_id : "%"}`}
  } : q ? {
    [Op.or]: [
      { title: { [Op.iLike]: { [Op.any]: `%${q.trim()}%`
        .replace(/ +(?= )/g,'')
        .replace(' ','% %')
        .split(' ')}}},
      { content: { [Op.iLike]: { [Op.any]: `%${q.trim()}%`
        .replace(/ +(?= )/g,'')
        .replace(' ','% %')
        .split(' ')}}}
      ]
  } : null;

  if (prompt_id) {
    if (condition) condition.prompt_id = { [Op.eq]: `${prompt_id}`}
    else condition = { prompt_id: { [Op.eq]: `${prompt_id}`}};
  }

  Writing.findAll({ where: condition })
  .then(data => {
    data = data.sort( (a, b) =>  {
      return b["id"] - a["id"];
    });
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving writings."
    });
  });
};

// Find a single Writing with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Writing.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Writing with id=" + id
    });
  });
};

// Update a Writing by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Writing.update(req.body, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Writing was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Writing with id=${id}. Maybe Writing was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Writing with id=" + id
    });
  });
};

// Delete a Writing with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Writing.destroy({
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Writing was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Writing with id=${id}. Maybe Writing was not found!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Could not delete Writing with id=" + id
    });
  });
};

// Delete all Writings from the database.
exports.deleteAll = (req, res) => {
  Writing.destroy({
    where: {},
    truncate: false
  })
  .then(nums => {
    res.send({ message: `${nums} Writings were deleted successfully!` });
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while removing all writings."
    });
  });
};

// Find all published Writings
exports.findAllPublished = (req, res) => {
  Writing.findAll({ where: { published: true } })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving writings."
    });
  });
};
