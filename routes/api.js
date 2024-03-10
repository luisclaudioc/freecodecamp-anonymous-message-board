'use strict';
const mongoose = require('mongoose');
const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const ReplyModel = require('../models').Reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    
    .post(async function(req, res) {
      let board = req.body.board;
      if (!board) {
        board = req.params.board;
      }
      const { text, delete_password } = req.body;
      const newThread = new ThreadModel({
        text: text,
        created_on: new Date(),
        bumped_on: new Date(),
        delete_password: delete_password,
      });

      try {
        const boardDoc = await BoardModel.findOne({ board: board });
        
        if (!boardDoc) {
          const newBoard = new BoardModel({ board: board });
          newBoard.threads.push(newThread);
          newBoard.save();
        } else {
          boardDoc.threads.push(newThread);
          boardDoc.save();
        }
      } catch(err) {
        res.json(err);
        return;
      }

      //res.json(newThread);
      res.redirect('/b/'+board+'/');
      return;
    })

    .get(async function(req, res) {
      const board = req.params.board;

      function compareDates(a,b) {
        return b.bumped_on - a.bumped_on || b.created_on - a.created_on;
      };

      const boardDoc = await BoardModel.findOne({ board: board });
      let result = boardDoc.threads.map((thread) => {
        const { _id, text, created_on, bumped_on, reported, delete_password, replies } = thread;
        return { _id, text, created_on, bumped_on, replies: replies.sort(compareDates).slice(0,3).map((reply) => {
          const { _id, text, created_on, reported, delete_password } = reply;
          return { _id, text, created_on }
        }), replycount: thread.replies.length };
      });
      
      result = result.sort(compareDates).slice(0,10)
      
      res.json(result);
      return;
    })

    .delete(async function(req, res) {
      const { board, thread_id, delete_password } = req.body;
      
      const boardDoc = await BoardModel.findOne({ board: board });
      if (boardDoc) {
        if (boardDoc.threads.id(thread_id).delete_password === delete_password) {
          boardDoc.threads.splice(boardDoc.threads.indexOf(boardDoc.threads.id(thread_id)), 1);
          boardDoc.save();
          res.send("success");
          return;
        } else {
          res.send("incorrect password")
          return;
        };
      };
    })

    .put(async function(req, res) {
      const { board, thread_id } = req.body;
      
      const boardDoc = await BoardModel.findOne({ board: board });
      if (boardDoc) {
        boardDoc.threads.id(thread_id).reported = true;
        boardDoc.save();
        res.send("reported");
        return;
      }
    })
    

  app.route('/api/replies/:board')
    
    .post(async function(req, res) {    
      let board = req.params.board;
      const { text, delete_password, thread_id } = req.body;

      const newReply = new ReplyModel({
        text: text,
        created_on: new Date(),
        delete_password: delete_password,
      }); 

      try {
        const boardDoc = await BoardModel.findOne({ board: board });

        if (boardDoc) {
          boardDoc.threads.id(thread_id).replies.push(newReply);
          boardDoc.threads.id(thread_id).bumped_on = new Date();
          boardDoc.save();
        };
      } catch(err) {
        res.json(err);
        return;
      }

      //res.json(newReply);
      res.redirect('/b/'+board+'/'+thread_id);
      return;
    })

    .get(async function(req, res) {
      const board = req.params.board;
      let thread_id = req.query.thread_id;

      function compareDates(a,b) {
        return b.bumped_on - a.bumped_on || b.created_on - a.created_on;
      };

      const boardDoc = await BoardModel.findOne({ board: board });
      //console.log(boardDoc.threads.id(thread_id)._id);
      if(boardDoc) {
        const { _id, text, created_on, bumped_on, reported, delete_password, replies } = boardDoc.threads.id(thread_id);
        const result = { _id, text, created_on, bumped_on, replies: replies.sort(compareDates).map((reply) => {
          const { _id, text, created_on, reported, delete_password } = reply;
            return { _id, text, created_on }
        }), replycount: replies.length };
        //console.log(result);
        res.json(result);
        return;
      }
    })

    .delete(async function(req, res) {
      const { board, thread_id, reply_id, delete_password } = req.body;
      
      const boardDoc = await BoardModel.findOne({ board: board });
      console.log(boardDoc.threads.id(thread_id).replies.id(reply_id))
      
      if (boardDoc) {
        if (boardDoc.threads.id(thread_id).replies.id(reply_id).delete_password === delete_password) {
          boardDoc.threads.id(thread_id).replies.id(reply_id).text = "[deleted]";
          boardDoc.save();
          res.send("success");
          return;
        } else {
          res.send("incorrect password")
          return;
        };
      };
    })

    .put(async function(req, res) {
      const { board, thread_id, reply_id } = req.body;
      
      const boardDoc = await BoardModel.findOne({ board: board });
      if (boardDoc) {
        boardDoc.threads.id(thread_id).replies.id(reply_id).reported = true;
        boardDoc.save();
        res.send("reported");
        return;
      }
    })

};
