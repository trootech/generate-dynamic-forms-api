const mongoose = require("mongoose");
const { Forms } = require('../models');
const { Fields } = require('../models');
const { FormsEntries } = require('../models');
const { FormsDataEntries } = require('../models');
const { FormsDataEntriesnew } = require('../models');
const { validationResult } = require("express-validator");
const labelmsg = require('../labels/response.labels');

exports.Create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return res.status(422).json({
            error: error.msg
        });
    }

    let data = req.body;
    let fieldsarr = data.fields;
    delete data._id;

    Forms.findOne({ form_key: data.form_key }).then((info) => {
        if (!info) {
            Fields.insertMany(fieldsarr,(err,fieldres)=>{
                if(err){
                    res.status(500).json({
                        success : false,
                        message : labelmsg.insertfailuremsg
                    })
                }
                else{
                    data.fields_id = fieldres;
                    Forms.create(data).then((response) => {
                        res.json({
                            success: true,
                            message: labelmsg.addedmsg
                        })
                    }).catch((err) => {
                        res.status(500).json({
                            success: false,
                            message: labelmsg.errormsg
                        })
                    })
                }
            })
        }
        else {
            res.json({
                success: false,
                message: labelmsg.keyalreadyExists
            })
        }

    })
}

exports.UpdateForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return res.status(422).json({
            error: error.msg
        });
    }

    let data = req.body;
    let fieldsarr = data.fields;
    let isError = false;

    Forms.findOneAndUpdate({ _id: data._id}, data).then((info) => {
        if (info) {
            const fieldId = data.fields.length > 0 ? data.fields?.map(x => (x._id)) : [];
            // User.updateMany({"created": false}, {"$set":{"created": true}});
                fieldId.forEach((element, index) => {
                    const updatedData = fieldsarr.find(x => x._id === element);
                    if(updatedData._id) {
                        Fields.findOneAndUpdate({_id: element}, updatedData).then((fieldres) =>{
                            if(fieldres) {
                                if(index === fieldId.length -1) {
                                    data.fields_id = fieldres;

                                }
                            }

                        }).catch(err => {
                                if(err){
                                    isError = true;
                                }
                        })
                    } else {
                        // console.log('>>>>>>>>>>>>>>>  ', fieldsarr[index]);
                        const {_id: _, ...insertObj} = fieldsarr[index];
                        // console.log( '-------------------------',insertObj);
                        Fields.insertMany(insertObj, async(err,fieldres)=>{
                            if(err){
                               return;
                            }
                            else{
                                let newFieldId = fieldres.find(x => x._id)._id
                                info.fields_id.push(newFieldId);
                                // console.log(info.fields_id, newFieldId);
                                // console.log(index , fieldId.length)
                                if(index === fieldId.length -1) {
                                    await info.save()
                                }

                            }
                        })
                    }
                });
                if(isError) {
                    return  res.status(500).json({
                          success : false,
                          message : labelMessage.updatefailuremsg
                      })
                  }


               return res.json({
                    success: true,
                    message: labelmsg.updatemsg
                })



        }
        else {
            res.json({
                success: false,
                message: labelmsg.formid
            })
        }

    })
}

exports.List = async (req, res) => {
    try {
        const result = await Forms.find({status: 1}).populate('fields_id').lean()
        const counterdata = await FormsDataEntriesnew.aggregate([
            {$group : { _id : '$form_id', count : {$sum : 1}}}
        ])
      const final = result.map(data=>{
      const datacounter =  counterdata.find(formdata=>formdata._id.toString() == data._id.toString())
            return {
                ...data,
                count :datacounter?.count ?datacounter.count : 0
            }
        })
        if(result) { res.status(200).json({message: labelmsg.recordfound ,data: final}) }
        else { res.status(200).json({message: labelmsg.recordNofound ,data: final}) }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.DetailsByID  = async (req, res) => {
    let id = req.query.id;
    try {
        const result = await Forms.findById(id).populate('fields_id')
        if(result) { res.status(200).json({message: labelmsg.recordfound,data: result}) }
        else { res.status(200).json({message: labelmsg.recordNofound,data: result}) }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.DeleteForm = (req, res) => {

    const id = req.query.id;
    Forms.findByIdAndRemove(id)
    .then(async data => {
        if(!data) {
            res.status(404).send({
                message: `Cannot delete form with id=${id}. Maybe form was not found!`
            })
        } else {
            const fieldId = await data.fields_id.map(x => (x).toString());

            console.log('IID ', data._id);
            let entries = await FormsEntries.deleteMany({form_id: mongoose.Types.ObjectId(id)})
            let entriesData = await FormsDataEntriesnew.deleteMany({form_id: mongoose.Types.ObjectId(id)})
            let fields = await Fields.deleteMany({_id : {$in: fieldId}})

            console.log(fieldId,  mongoose.Types.ObjectId(id));

            if(fields && entriesData && entries) {
                res.send({message: "Form deleted successfully!"});
            } else {
                res.status(500).send({
                    message: "Could not delete form with id=" + id
                });
            }

        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Could not delete form with id=" + id
        });
    });
}

exports.SaveFormDetails = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0];
        return res.status(422).json({
            error: error.msg
        });
    }
    let data = req.body;
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let validationerr = false;
    await data.fields?.forEach(element => {
        if(element.validation){
            for (const [key, value] of Object.entries(element?.validation)) {
                if(key === 'required'){
                    if(!element.value){
                        validationerr = true;
                        return res.status(422).json({
                            error: `Field value for ${element.field_label} is mandatory!`
                        });
                    }
                }
                if(key === 'max'){
                    if(element.value){
                        if(element.value.length > value){
                            validationerr = true;
                            return res.status(422).json({
                                error: `Maximum length should be ${value} !`
                            });
                        }
                    }
                }
                if(key === 'min'){
                    if(element.value){
                        if(element.value.length < value){
                            validationerr = true;
                            return res.status(422).json({
                                error: `Minimum length should be ${value} !`
                            });
                        }
                    }
                }
                if(key === 'email'){
                    if(!element.value.match(mailformat)){
                        validationerr = true;
                        return res.status(422).json({
                            error: `Invalid email address !`
                        });
                    }
                }
            }
        }
    });
    if(!validationerr){
        await FormsEntries.create({form_id: data._id}).then(async (entryres) => {
            if(!res){
                return res.status(500).json({
                    success : false,
                    message : "Unable to create new field!"
                })
            }else{
                let listentries = await data.fields?.map((ele) => {
                    return({
                        form_id: data._id,
                        field_id: ele._id,
                        entry_id: entryres._id,
                        value: ele.value
                    })
                })
                await FormsDataEntries.insertMany(listentries,(err,fieldres)=>{
                    if(err){
                        return res.status(500).json({
                            success : false,
                            message : "Unable to create new field!"
                        })
                    }
                    else{
                        return res.json({
                            success: true,
                            message: labelmsg.addedmsg
                        })
                    }
                })
            }
        }).catch((err)=> {
            return res.status(500).json({
                success: false,
                message: labelmsg.errormsg
            })
        })
    }
}

exports.SaveFormDetailsNew = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = errors.array()[0];
            return res.status(422).json({
                error: error.msg
            });
        }
        let data = req.body
        // console.log("-----------------testlog",data)
        console.log(data.value)
        // data.value = JSON.parse(data.value)
        data.value = typeof data.value == 'string' ?  JSON.parse(data.value) : data.value;
        // data.value = JSON.parse(data.value)
        data.is_visible_in_entery = JSON.parse(data.is_visible_in_entery)
        let formdata = req.body.form_id
        if(req.file){
        let imagestring = req.file.filepath + req.file.filename
        data.value[req.body.imagename] = imagestring
        }

        await FormsEntries.create({form_id:formdata}).then(async (entryres) => {
                        let listentries = {
                        form_id: data.form_id,
                        entry_id: entryres._id,
                        is_visible_in_entery: data.is_visible_in_entery,
                        value: data.value
                    }
        await FormsDataEntriesnew.create(listentries)
        })

        res.status(200).json({
            success: true,
            newdata:data,
            message: labelmsg.addedmsg
        })
    }
    catch (err) {
        console.log("---------",err)
        res.status(500).json({
            success: false,
            message: 'info.controller: ' + err.message
        });
    }
}

exports.GetAllFormEntriesNew = async(req, res) => {
    let formId = req.query.form_id;
    try {
        var condition = formId ? {form_id: formId} : {};
        const result = await FormsDataEntriesnew.find(condition)

        if(result.length>0) {
            result.forEach(element => {
                for (const key in element.value) {
                    if (Object.hasOwnProperty.call(element.value, key)) {
                        const x = element.value[key];
                        const dataType = typeof x;

                        if(dataType.toString() === 'object' &&  !Array.isArray(x)){
                            let data = Object.keys(x)
                            let data1 = Object.values(x)
                            let nData = data.filter((x, index) => data1[index] ? x : '')
                            element.value[key] = nData;
                        } else if(Array.isArray(x)) {
                            let nData = []
                           x.forEach(element => {
                            nData.push(element.value_text);
                           });
                           element.value[key] = nData;
                        }
                    }
                }
            });

            res.status(200).json({message: "Record's Found" ,data: result})
        } else {
            res.status(200).json({message: "No Record's Found"})
        }
    } catch (error) {

    }

}

exports.GetAllFormEntries = async (req,res) => {
    let formid = req.query.form_id;
    try {
        const result = await FormsEntries.aggregate([
            {
                $match: {
                    form_id : new mongoose.Types.ObjectId(formid)
                }
            },
            {
                $lookup: {
                    from: 'formsdataentries',
                    localField: '_id',
                    foreignField: 'entry_id',
                    as: 'entries_list',
                }
            },
            {
                $unwind: {
                    path: "$entries_list",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'fields',
                    localField: 'entries_list.field_id',
                    foreignField: '_id',
                    as: 'entries_list.field_data',
                }
            },
            {
                $group:{
                    _id: "$_id",
                    entries_list: { $push: "$entries_list" }
                }
            },
            {
                $project:{
                    '__v': 0,
                    'createdAt' : 0,
                    'updatedAt' : 0,
                    'entries_list.__v': 0,
                    'entries_list.createdAt' : 0,
                    'entries_list.updatedAt' : 0
                }
            }
        ])
        if(result) { res.status(200).json({message: "Record's Found" ,data: result}) }
        else { res.status(200).json({message: "No Record's Found" ,data: result}) }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.GetEntriesByEntryID = async (req,res) => {
    let queryData = {
        form_id: req.query.form_id,
        entry_id: req.query.entry_id
    }
    try {
        const result = await FormsDataEntriesnew.find(queryData, {'__v': 0, 'createdAt' : 0, 'updatedAt' : 0})
        .populate('value',{'__v': 0, 'createdAt' : 0, 'updatedAt' : 0})
        if(result) { res.status(200).json({message: "Record's Found" ,data: result}) }
        else { res.status(200).json({message: "No Record's Found" ,data: result}) }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

exports.UpdateEntriesNew = async (req, res) => {

    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = errors.array()[0];
            return res.status(422).json({
                error: error.msg
            });
        }
        let data = req.body;
        // data.value = JSON.parse(data.value)
        data.value = typeof data.value == 'string' ?  JSON.parse(data.value) : data.value;
        if(req.file){
            let imagestring = req.file.filepath + req.file.filename

            data.value[req.body.imagename] = imagestring
        }
      const result = await FormsDataEntriesnew.findByIdAndUpdate({_id: data._id}, data, {useFindAndModify: false, new: true})
            if(!result) {
                res.status(404).json({
                    success: false,
                    message: `Can not update form entry of ${data._id}`
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: labelmsg.updatemsg
                })
            }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Unable to update fields.'
        })
    }
}

exports.DeleteEntries = async (req,res) => {
    let entryid = req.query.entry_id;
    try {
        const result = await FormsDataEntriesnew.deleteMany({entry_id: entryid})
        if(result) {
            await FormsEntries.findByIdAndRemove({_id: entryid}).then((deleteres) => {
                res.status(200).json({success: true, message: "Record's Deleted"})
            }).catch((err)=> {
                res.status(500).json({
                    success: false,
                    message: labelmsg.errormsg
                })
            })
        }
        else { res.status(202).json({success: false, message: "No Record's Deleted"}) }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}