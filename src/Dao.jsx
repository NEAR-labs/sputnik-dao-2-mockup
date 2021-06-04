import React, {useEffect, useState} from 'react'
import Navbar from "./Navbar";
import Footer from "./Footer";
import useRouter from './utils/use-router'
import {useParams} from "react-router-dom";

import {
  MDBBox,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBContainer,
  MDBInput,
  MDBMask,
  MDBModal,
  MDBModalBody,
  MDBModalFooter,
  MDBModalHeader,
  MDBNotification,
  MDBRow,
  MDBView,
  MDBIcon, MDBLink, MDBAlert
} from "mdbreact";
import {useGlobalMutation, useGlobalState} from './utils/container'
import {Decimal} from 'decimal.js';
import Selector from "./Selector";
import {
  convertDuration,
  proposalsReload,
  timestampToReadable,
  updatesJsonUrl,
  yoktoNear,
  parseForumUrl
} from './utils/funcs'
import getConfig from "./config";
import * as nearApi from "near-api-js";
import {Contract} from "near-api-js";
import {Proposal} from './ProposalPage';
import Loading from "./utils/Loading";


const Dao = () => {
  const routerCtx = useRouter()
  const stateCtx = useGlobalState()
  const mutationCtx = useGlobalMutation()
  const [numberProposals, setNumberProposals] = useState(0);
  const [proposals, setProposals] = useState(null);
  const [showError, setShowError] = useState(null);
  const [addProposalModal, setAddProposalModal] = useState(false);
  const [newProposalCouncilMember, setNewProposalCouncilMember] = useState(false);
  const [newProposalPayout, setNewProposalPayout] = useState(false);
  const [newProposalToken, setNewProposalToken] = useState(false);
  const [selectDao, setSelectDao] = useState(false);
  const [showNewProposalNotification, setShowNewProposalNotification] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [daoState, setDaoState] = useState(0);
  const [daoConfig, setDaoConfig] = useState(null);
  const [daoPolicy, setDaoPolicy] = useState(null);
  const [daoStaking, setDaoStaking] = useState(null);
  const [disableTarget, setDisableTarget] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);


  const [proposalToken, setProposalToken] = useState({
    ownerId: null,
    totalSupply: null,
    name: null,
    symbol: null,
    icon: null,
    decimals: null,
  });

  const [proposalTokenOwner, setProposalTokenOwner] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenSupply, setProposalTokenSupply] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenName, setProposalTokenName] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenSymbol, setProposalTokenSymbol] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenIcon, setProposalTokenIcon] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalTokenDecimals, setProposalTokenDecimals] = useState({
    value: "",
    valid: true,
    message: "",
  });

  const [proposalKind, setProposalKind] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalTarget, setProposalTarget] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalDescription, setProposalDescription] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalDiscussion, setProposalDiscussion] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [proposalAmount, setProposalAmount] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [votePeriod, setVotePeriod] = useState({
    value: "",
    valid: true,
    message: "",
  });
  const [changePurpose, setChangePurpose] = useState({
    value: "",
    valid: true,
    message: "",
  });

  let {dao} = useParams();

  useEffect(
    () => {
      if (stateCtx.config.contract === "") {
        if (dao !== undefined) {
          mutationCtx.updateConfig({
            contract: dao,
          })
        } else {
          setSelectDao(true);
        }
      } else {
        window.contract = new Contract(window.walletConnection.account(), stateCtx.config.contract, {
          viewMethods: [
            'get_config', 'get_policy', 'get_staking_contract', 'get_available_amount', 'delegation_total_supply',
            'get_proposals', 'get_last_proposal_id', 'get_proposal', 'get_bounty', 'get_bounties', 'get_last_bounty_id',
            'get_bounty_claims', 'get_bounty_number_of_claims', 'delegation_balance_of', 'has_blob'
          ],
          changeMethods: ['add_proposal', 'act_proposal'],
        })
      }
    },
    [stateCtx.config.contract]
  )


  useEffect(
    () => {
      if (stateCtx.config.contract !== "" && dao !== stateCtx.config.contract && dao !== undefined) {
        mutationCtx.updateConfig({
          contract: "",
        });
        location.reload();
      }
    },
    [stateCtx.config.contract]
  )


  useEffect(
    () => {
      if (stateCtx.config.contract !== "") {
        window.contract.get_policy()
          .then(r => {
            setDaoPolicy(r);
          }).catch((e) => {
          console.log(e);
          setShowError(e);
        })
      }
    },
    [stateCtx.config.contract]
  )

  useEffect(
    () => {
      if (stateCtx.config.contract !== "") {
        window.contract.get_config()
          .then(r => {
            setDaoConfig(r);
          }).catch((e) => {
          console.log(e);
          setShowError(e);
        })
      }
    },
    [stateCtx.config.contract]
  )

  useEffect(
    () => {
      if (stateCtx.config.contract !== "") {
        window.contract.get_staking_contract()
          .then(r => {
            setDaoStaking(r);
          }).catch((e) => {
          console.log(e);
          setShowError(e);
        })
      }
    },
    [stateCtx.config.contract]
  )

  const toggleProposalModal = () => {
    setAddProposalModal(!addProposalModal);
  }

  const toggleNewCouncilMember = () => {
    setNewProposalCouncilMember(!newProposalCouncilMember);
    setAddProposalModal(false);
  }

  const toggleNewPayout = () => {
    setNewProposalPayout(!newProposalPayout);
    setAddProposalModal(false);
  }

  const toggleNewToken = () => {
    setNewProposalToken(!newProposalToken);
    setAddProposalModal(false);
  }


  const nearConfig = getConfig(process.env.NODE_ENV || 'development')
  const provider = new nearApi.providers.JsonRpcProvider(nearConfig.nodeUrl);
  const connection = new nearApi.Connection(nearConfig.nodeUrl, provider, {});

  async function accountExists(accountId) {
    try {
      await new nearApi.Account(connection, accountId).state();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function getDaoState(dao) {
    try {
      const state = await new nearApi.Account(connection, dao).state();
      const amountYokto = new Decimal(state.amount);
      return amountYokto.div(yoktoNear).toFixed(2);
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  const [firstRun, setFirstRun] = useState(true);

  const getProposals = () => {
    if (stateCtx.config.contract !== "") {
      window.contract.get_last_proposal_id()
        .then(number => {
          setNumberProposals(number);
          mutationCtx.updateConfig({
            lastShownProposal: number
          })
          window.contract.get_proposals({from_index: 0, limit: number})
            .then(list => {
              const t = []
              list.map((item, key) => {
                const t2 = {}
                Object.assign(t2, {key: key}, item);
                t.push(t2);
              })
              setProposals(t);
              setShowLoading(false);
            });
        }).catch((e) => {
        console.log(e);
        setShowError(e);
        setShowLoading(false);
      })
    }
  }


  useEffect(
    () => {
      if (!firstRun) {
        const interval = setInterval(() => {
          console.log('loading proposals')
          getProposals();
        }, proposalsReload);
        return () => clearInterval(interval);
      } else {
        getProposals();
        setFirstRun(false);
      }
    },
    [stateCtx.config.contract, firstRun]
  )

  useEffect(
    () => {
      if (stateCtx.config.contract !== "") {
        getDaoState(stateCtx.config.contract).then(r => {
          setDaoState(r);
        }).catch((e) => {
          console.log(e);
          setShowError(e);
        })
      }
    },
    [stateCtx.config.contract]
  )


  const handleDaoChange = () => {
    mutationCtx.updateConfig({
      contract: '',
    })
    routerCtx.history.push('/')
  }

  const validateString = (field, name, showMessage) => {
    if (name && name.length >= 1) {
      return true;
    } else {
      showMessage(field + " > 1 chars", 'warning', field);
      return false;
    }
  }
  const validateLongString = (field, name, showMessage) => {
    if (name && name.length >= 3 && name.length <= 1024) {
      return true;
    } else {
      showMessage("> 3 and < 1024 chars", 'warning', field);
      return false;
    }
  }


  const validateProposalDiscussion = (field, name, showMessage) => {
    let categories = parseForumUrl(name);
    /* Hardcoded exclusion of rucommunity.sputnikdao.near from field validation */
    if (categories === name && stateCtx.config.contract !== 'rucommunity.sputnikdao.near') {
      showMessage("Wrong link format", 'warning', field);
      return false;
    } else {
      return true;
    }
  }

  const validateNumber = (field, name, showMessage) => {
    if (name && !isNaN(name) && name.length > 0) {
      return true;
    } else {
      showMessage("Please enter number", 'warning', field);
      return false;
    }
  }

  const validateField = (field, value) => {
    switch (field) {
      case "proposalKind":
        return value !== 'false';
      case "proposalTarget":
      case "changePurpose":
        return validateString(field, value, showMessage.bind(this));
      case "proposalDescription":
        return validateLongString(field, value, showMessage.bind(this));
      case "proposalTokenOwner":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenSupply":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenName":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenSymbol":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenIcon":
        return validateString(field, value, showMessage.bind(this));
      case "proposalTokenDecimals":
        return validateString(field, value, showMessage.bind(this));
      case "proposalDiscussion":
        return validateProposalDiscussion(field, value, showMessage.bind(this));
      case "proposalAmount":
      case "votePeriod":
        return validateNumber(field, value, showMessage.bind(this));
    }
  };

  const changeSelectHandler = (event) => {
    if (event.target.value === "NewCouncil" || event.target.value === "RemoveCouncil") {
      setShowCouncilChange(true)
      setShowPayout(false)
      setShowChangePurpose(false)
      setShowVotePeriod(false)
      setDisableTarget(false)
      setProposalTarget({value: '', valid: true, message: ''});
    }

    if (event.target.value === "ChangeVotePeriod") {
      setShowVotePeriod(true)
      setShowPayout(false)
      setShowChangePurpose(false)
      setShowCouncilChange(false)
      setProposalTarget({value: window.walletConnection.getAccountId(), valid: true, message: ''});
      setDisableTarget(true)
    }

    if (event.target.value === "ChangePurpose") {
      setShowChangePurpose(true)
      setShowPayout(false)
      setShowVotePeriod(false)
      setShowCouncilChange(false)
      setProposalTarget({value: window.walletConnection.getAccountId(), valid: true, message: ''});
      setDisableTarget(true)
    }

    if (event.target.value === "Payout") {
      setShowPayout(true)
      setShowChangePurpose(false)
      setShowVotePeriod(false)
      setShowCouncilChange(false)
      setDisableTarget(false)
      setProposalTarget({value: '', valid: true, message: ''});
    }


    if (event.target.name === "proposalKind") {
      setProposalKind({value: event.target.value, valid: !!event.target.value});
    }

  };

  const changeHandler = (event) => {
    if (event.target.name === "proposalTarget") {
      setProposalTarget({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTarget.message
      });
    }

    if (event.target.name === "proposalTokenOwner") {
      setProposalTokenOwner({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenOwner.message
      });
    }

    if (event.target.name === "proposalTokenSupply") {
      setProposalTokenSupply({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenSupply.message
      });
    }

    if (event.target.name === "proposalTokenName") {
      setProposalTokenName({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenName.message
      });
    }

    if (event.target.name === "proposalTokenSymbol") {
      setProposalTokenSymbol({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalTokenSymbol.message
      });
    }

    if (event.target.name === "proposalTokenIcon") {
      setProposalTokenIcon({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenIcon.message
      });
    }

    if (event.target.name === "proposalTokenDecimals") {
      setProposalTokenDecimals({
        value: event.target.value.toLowerCase(),
        valid: !!event.target.value,
        message: proposalTokenDecimals.message
      });
    }

    if (event.target.name === "proposalDescription") {
      setProposalDescription({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalDescription.message
      });
    }
    if (event.target.name === "proposalDiscussion") {
      setProposalDiscussion({
        value: event.target.value,
        valid: !!event.target.value,
        message: proposalDiscussion.message
      });
    }
    if (event.target.name === "proposalAmount") {
      setProposalAmount({value: event.target.value, valid: !!event.target.value, message: proposalAmount.message});
    }
    if (event.target.name === "votePeriod") {
      setVotePeriod({value: event.target.value, valid: !!event.target.value, message: votePeriod.message});
    }
    if (event.target.name === "changePurpose") {
      setChangePurpose({value: event.target.value, valid: !!event.target.value, message: changePurpose.message});
    }

    if (!validateField(event.target.name, event.target.value)) {
      event.target.className = "form-control is-invalid";
    } else {
      event.target.className = "form-control is-valid";
    }
  };

  const showMessage = (message, type, field) => {
    message = message.trim();
    if (message) {
      switch (field) {
        case "proposalKind":
          setProposalKind(prevState => ({...prevState, message: message}));
          break;
        case "proposalTarget":
          setProposalTarget(prevState => ({...prevState, message: message}));
          break;
        case "proposalDescription":
          setProposalDescription(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenOwner":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenSupply":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenName":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenSymbol":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenIcon":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalTokenDecimals":
          setProposalTokenOwner(prevState => ({...prevState, message: message}));
          break;
        case "proposalDiscussion":
          setProposalDiscussion(prevState => ({...prevState, message: message}));
          break;
        case "proposalAmount":
          setProposalAmount(prevState => ({...prevState, message: message}));
          break;
      }
    }
  };


  const [switchState, setSwitchState] = useState({
    switchAll: stateCtx.config.filter.switchAll,
    switchInProgress: stateCtx.config.filter.switchInProgress,
    switchDone: stateCtx.config.filter.switchDone,
    switchNew: stateCtx.config.filter.switchNew,
    switchExpired: stateCtx.config.filter.switchExpired,
  });

  const handleSwitchChange = switchName => () => {
    let switched = {}
    switch (switchName) {
      case 'switchAll':
        switched = {
          switchAll: !switchState.switchAll,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
          switchExpired: false,
        }
        break;

      case 'switchInProgress':
        switched = {
          switchAll: false,
          switchInProgress: !switchState.switchInProgress,
          switchDone: switchState.switchDone,
          switchNew: false,
          switchExpired: false,
        }
        break;

      case 'switchDone':
        switched = {
          switchAll: false,
          switchInProgress: switchState.switchInProgress,
          switchDone: !switchState.switchDone,
          switchNew: false,
          switchExpired: false,
        }
        break;

      case 'switchNew':
        switched = {
          switchAll: false,
          switchInProgress: false,
          switchDone: false,
          switchNew: !switchState.switchNew,
          switchExpired: false,
        }
        break;

      case 'switchExpired':
        switched = {
          switchAll: false,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
          switchExpired: !switchState.switchExpired,
        }
        break;

      default:
        switched = {
          switchAll: true,
          switchInProgress: false,
          switchDone: false,
          switchNew: false,
        }
        break;


    }
    setSwitchState(switched);
    mutationCtx.updateConfig({filter: switched})
  }

  const detectLink = (string) => {
    let urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;

    if (!urlRegex.test(string)) {
      return false;
    } else {
      console.log(string.match(urlRegex))
      return string.match(urlRegex);
    }
  }

  const submitProposal = async (e) => {
    e.preventDefault();
    e.persist();


    {/* --------------------------------------------------------------------------------------------------- */
    }
    {/* --------------------------------------- Add council member ---------------------------------------- */
    }
    {/* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === 'newProposalCouncilMember') {
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateTarget = validateField("proposalTarget", proposalTarget.value);
      let validateDescription = validateField("proposalDescription", proposalDescription.value);

      if (validateTarget && nearAccountValid && validateDescription) {
        try {
          setShowSpinner(true);
          await window.contract.add_proposal({
              proposal: {
                description: (e.target.proposalDescription.value).trim(),
                kind: {
                  AddMemberToRole: {
                    member_id: e.target.proposalTarget.value,
                    role: "council"
                  }
                }
              },
            },
            new Decimal("30000000000000").toString(), daoPolicy.proposal_bond.toString(),
          )
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      }
    }

    {/* --------------------------------------------------------------------------------------------------- */
    }
    {/* ---------------------------------------- Add payout proposal -------------------------------------- */
    }
    {/* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === 'newProposalPayout') {
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateTarget = validateField("proposalTarget", proposalTarget.value);
      let validateDescription = validateField("proposalDescription", proposalDescription.value);
      const amount = new Decimal(e.target.proposalAmount.value);
      const amountYokto = amount.mul(yoktoNear).toFixed();

      if (validateTarget && nearAccountValid && validateDescription) {
        try {
          setShowSpinner(true);
          await window.contract.add_proposal({
              proposal: {
                description: (e.target.proposalDescription.value).trim(),
                kind: {
                  Transfer: {
                    token_id: "",
                    receiver_id: e.target.proposalTarget.value,
                    amount: amountYokto,
                  }
                }
              },
            },
            new Decimal("30000000000000").toString(), daoPolicy.proposal_bond.toString(),
          )
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      }
    }
    {/* --------------------------------------------------------------------------------------------------- */
    }
    {/* ------------------------------------------- Token Farm -------------------------------------------- */
    }
    {/* --------------------------------------------------------------------------------------------------- */
    }
    if (e.target.name === 'newProposalToken') {
      const stringifyObject = require('stringify-object');
      const nearAccountValid = await accountExists(proposalTarget.value);
      let validateTarget = validateField("proposalTarget", proposalTarget.value);
      let validateDescription = validateField("proposalDescription", proposalDescription.value);
      const supply = new Decimal(e.target.proposalTokenSupply.value.trim());
      const supplyYokto = supply.mul(yoktoNear).toFixed();

      const argsList = {
        args: {
          owner_id: e.target.proposalTokenOwner.value.trim(),
          total_supply: supplyYokto,
          metadata: {
            spec: "ft-1.0.0",
            name: e.target.proposalTokenName.value.trim(),
            symbol: e.target.proposalTokenSymbol.value.trim(),
            icon: e.target.proposalTokenIcon.value.trim(),
            decimals: '^' + e.target.proposalTokenDecimals.value + '^',
          },
        },
      }
      //console.log(JSON.stringify(argsList).replaceAll('^"', '').replaceAll('"^', ''));
      const args = Buffer.from(JSON.stringify(argsList).replaceAll('^"', '').replaceAll('"^', '')).toString('base64')


      if (validateTarget && nearAccountValid && validateDescription) {
        try {
          setShowSpinner(true);
          await window.contract.add_proposal({
              proposal: {
                description: (e.target.proposalDescription.value).trim(),
                kind: {
                  FunctionCall: {
                    receiver_id: e.target.proposalTarget.value,
                    actions: [{
                      method_name: "create_token",
                      args: args,
                      deposit: "5000000000000000000000000",
                      gas: "150000000000000"
                    }],
                  }
                }
              },
            },
            new Decimal("200000000000000").toString(), daoPolicy.proposal_bond.toString(),
          )
        } catch (e) {
          console.log(e);
          setShowError(e);
        } finally {
          setShowSpinner(false);
        }
      }
    }

    /*
    const nearAccountValid = await accountExists(proposalTarget.value);
    let validateTarget = validateField("proposalTarget", proposalTarget.value);
    let validateDescription = validateField("proposalDescription", proposalDescription.value);
    //let validateDiscussion = validateField("proposalDiscussion", proposalDiscussion.value);
    let validateChangePurpose = validateField("changePurpose", changePurpose.value);
    let validateAmount = validateField("proposalAmount", proposalAmount.value);


    if (showChangePurpose) {
      if (!validateChangePurpose) {
        e.target.changePurpose.className += " is-invalid";
        e.target.changePurpose.classList.remove("is-valid");
      } else {
        e.target.changePurpose.classList.remove("is-invalid");
        e.target.changePurpose.className += " is-valid";
      }
    }*/


    /*
        if (showPayout) {
          if (!validateAmount) {
            e.target.proposalAmount.className += " is-invalid";
            e.target.proposalAmount.classList.remove("is-valid");
          } else {
            e.target.proposalAmount.classList.remove("is-invalid");
            e.target.proposalAmount.className += " is-valid";
          }
        }

        const parseForum = parseForumUrl(e.target.proposalDiscussion.value);

        if (showPayout) {
          if (e.target.proposalKind.value !== 'false' && nearAccountValid && validateTarget && validateDescription && validateAmount && validateDiscussion) {
            try {
              setShowSpinner(true);
              const amount = new Decimal(e.target.proposalAmount.value);
              const amountYokto = amount.mul(yoktoNear).toFixed();

              await window.contract.add_proposal({
                  proposal: {
                    target: e.target.proposalTarget.value,
                    description: (e.target.proposalDescription.value + " " + parseForum).trim(),
                    kind: {
                      type: e.target.proposalKind.value,
                      amount: amountYokto,
                    }
                  },
                },
                new Decimal("30000000000000").toString(), bond.toString(),
              )

            } catch (e) {
              console.log(e);
              setShowError(e);
            } finally {
              setShowSpinner(false);
            }
          }
        }

         */


  }

  return (
    <MDBView className="w-100 h-100" style={{minHeight: "100vh"}}>
      <MDBMask className="d-flex justify-content-center align-items-center unique-color-dark gradient"/>
      <Navbar/>
      <MDBContainer style={{minHeight: "100vh"}}>
        <MDBAlert color="danger" className="text-center">
          Beta software. Test in prod. <b>Not audited.</b> Use at your own risk!
        </MDBAlert>
        {stateCtx.config.contract && !selectDao ?
          <>
            <MDBRow>
              <MDBCol className="col-12 p-3 mx-auto">
                <MDBCard className="stylish-color">
                  <MDBCardBody>
                    <MDBRow>
                      <MDBCol>
                        <MDBCard className="p-0 m-2 stylish-color-dark white-text">
                          <MDBCardHeader className="h4-responsive">Council:</MDBCardHeader>
                          <MDBCardBody className="p-4">
                            {daoPolicy ? daoPolicy.roles[1].kind.Group.map((item, key) => <div
                              key={key}>{item}</div>) : null}
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                      <MDBCol className="col-12 col-md-6">
                        <MDBCard className="p-0 m-2 stylish-color-dark white-text">
                          <MDBCardHeader className="h5-responsive">
                            <MDBRow>
                              <MDBCol>
                                Properties:
                              </MDBCol>
                              <MDBCol className="">
                                <MDBBox className="text-right">
                                  <MDBBtn size="sm" onClick={handleDaoChange} color="elegant">Change DAO</MDBBtn>
                                </MDBBox>
                              </MDBCol>
                            </MDBRow>
                          </MDBCardHeader>
                          <MDBCardBody className="p-2">


                            <ul>
                              <li>Network: <a className="white-text btn-link" target="_blank"
                                              href={stateCtx.config.network.explorerUrl}>{stateCtx.config.network.networkId}</a>
                              </li>
                              <li>DAO: {stateCtx.config.contract}</li>
                              <li>Bond:{" "}
                                <span
                                  style={{fontSize: 12}}>Ⓝ{" "}</span>{daoPolicy && daoPolicy.proposal_bond !== null ? (new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear)).toString() : ''}
                              </li>
                              <li>Purpose:{" "}
                                {
                                  daoConfig ? daoConfig.purpose.split(" ").map((item, key) => (
                                    /(((https?:\/\/)|(www\.))[^\s]+)/g.test(item) ?
                                      <a className="white-text btn-link" target="_blank"
                                         href={item}>{item}{" "}</a> : <>{item}{" "}</>
                                  )) : null
                                }
                              </li>
                              <li>Vote Period: {daoPolicy ? timestampToReadable(daoPolicy.proposal_period) : ''}</li>
                              <li>Staking Contract: {daoStaking ? daoStaking : ''}</li>
                              <li>DAO Funds: Ⓝ {daoState ? daoState : ''}</li>
                            </ul>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                    </MDBRow>
                    {window.walletConnection.getAccountId() ?
                      <MDBRow className="mx-auto p-2">
                        <MDBCol className="text-center">
                          <MDBBtn style={{borderRadius: 10}} size="sm" onClick={toggleProposalModal} color="elegant">ADD
                            NEW PROPOSAL</MDBBtn>
                        </MDBCol>
                      </MDBRow>
                      : null}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>

            <MDBRow>
              <MDBCol className="col-12 p-3 mx-auto">
                <MDBCard className="stylish-color-dark white-text">
                  <MDBCardBody>
                    <MDBRow center>
                      <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                        <div className='custom-control custom-switch mr-2'>
                          <input
                            type='checkbox'
                            className='custom-control-input'
                            id='switchAll'
                            checked={switchState.switchAll}
                            onChange={handleSwitchChange('switchAll')}
                            readOnly
                          />
                          <label className='custom-control-label' htmlFor='switchAll'>
                            Show All
                          </label>
                        </div>
                      </MDBCard>
                      <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                        <div className='custom-control custom-switch mr-2'>
                          <input
                            type='checkbox'
                            className='custom-control-input'
                            id='switchInProgress'
                            checked={switchState.switchInProgress}
                            onChange={handleSwitchChange('switchInProgress')}
                            readOnly
                          />
                          <label className='custom-control-label' htmlFor='switchInProgress'>
                            In Progress
                          </label>
                        </div>
                      </MDBCard>
                      <MDBCard className="p-2 mr-2 mb-2 stylish-color-dark white-text">
                        <div className='custom-control custom-switch mr-2'>
                          <input
                            type='checkbox'
                            className='custom-control-input'
                            id='switchDone'
                            checked={switchState.switchDone}
                            onChange={handleSwitchChange('switchDone')}
                            readOnly
                          />
                          <label className='custom-control-label' htmlFor='switchDone'>
                            Done
                          </label>
                        </div>
                      </MDBCard>
                      <MDBCard className="p-2 mb-2 stylish-color-dark white-text">
                        <div className='custom-control custom-switch mr-2'>
                          <input
                            type='checkbox'
                            className='custom-control-input'
                            id='switchExpired'
                            checked={switchState.switchExpired}
                            onChange={handleSwitchChange('switchExpired')}
                            readOnly
                          />
                          <label className='custom-control-label' htmlFor='switchExpired'>
                            Expired
                          </label>
                        </div>
                      </MDBCard>

                    </MDBRow>
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>

            <MDBRow className="">
              {numberProposals > 0 && proposals !== null ?
                proposals.sort((a, b) => b.key >= a.key ? 1 : -1).map((item, key) => (
                  <>
                    {
                      (convertDuration(new Decimal(item.submission_time).plus(daoPolicy.proposal_period)) > new Date() && item.status === 'InProgress' && switchState.switchInProgress)
                      || (convertDuration(new Decimal(item.submission_time).plus(daoPolicy.proposal_period)) < new Date() && item.status === 'InProgress' && switchState.switchExpired)
                      || item.status === 'Expired' && switchState.switchExpired
                      || switchState.switchAll
                      || (item.status === 'Rejected' && switchState.switchDone)
                      || (item.status === 'Approved' && switchState.switchDone)
                      || (item.status === 'Removed' && switchState.switchDone)
                      || (convertDuration(new Decimal(item.submission_time).plus(daoPolicy.proposal_period)) > new Date() && item.status === 'InProgress' && item.key >= stateCtx.config.lastShownProposal && switchState.switchNew)

                        ?
                        <Proposal dao={stateCtx.config.contract} data={item} key={item.id} id={item.id}
                                  daoPolicy={daoPolicy}
                                  setShowError={setShowError}/>
                        : null
                    }
                  </>
                ))
                : null
              }
            </MDBRow>
            {showError !== null ?
              <MDBNotification
                autohide={36000}
                bodyClassName="p-5 font-weight-bold white-text"
                className="stylish-color-dark"
                closeClassName="white-text"
                fade
                icon="bell"
                iconClassName="orange-text"
                message={showError.toString().trim()}
                show
                text=""
                title=""
                titleClassName="elegant-color-dark white-text"
                style={{
                  position: "fixed",
                  top: "60px",
                  right: "10px",
                  zIndex: 9999
                }}
              />
              : null
            }

            {showNewProposalNotification ?
              <MDBNotification
                autohide={36000}
                bodyClassName="p-5 font-weight-bold white-text"
                className="stylish-color-dark"
                closeClassName="white-text"
                fade
                icon="bell"
                iconClassName="orange-text"
                message="A new proposal has been added!"
                show
                text=""
                title=""
                titleClassName="elegant-color-dark white-text"
                style={{
                  position: "fixed",
                  top: "60px",
                  left: "10px",
                  zIndex: 9999
                }}
              />
              : null
            }
            <MDBModal isOpen={addProposalModal} toggle={toggleProposalModal} centered position="center" size="lg">
              <MDBModalHeader className="text-center stylish-color white-text border-dark"
                              titleClass="w-100 font-weight-bold"
                              toggle={toggleProposalModal}>
                Select Proposal Type
              </MDBModalHeader>
              <MDBModalBody style={{background: 'rgb(213, 211, 211)'}}>
                <MDBRow>
                  <MDBCol className="col-12 col-md-6 col-lg-4">
                    <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                      <MDBCardBody className="text-center white-text">
                        <MDBIcon icon="user-secret" size="4x"/>
                        <hr/>
                        <a href="#" onClick={toggleNewCouncilMember} className="stretched-link grey-text white-hover">Council
                          Member</a>
                      </MDBCardBody>
                    </MDBCard>
                  </MDBCol>
                  <MDBCol className="col-12 col-md-6 col-lg-4">
                    <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                      <MDBCardBody className="text-center white-text">
                        <MDBIcon icon="hand-holding-usd" size="4x"/>
                        <hr/>
                        <a href="#" onClick={toggleNewPayout}
                           className="stretched-link grey-text white-hover">Payout</a> </MDBCardBody>
                    </MDBCard>
                  </MDBCol>
                  <MDBCol className="col-12 col-md-6 col-lg-4">
                    <MDBLink to="#">
                      <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                        <MDBCardBody className="text-center white-text">
                          <MDBIcon icon="tractor" size="4x"/>
                          <hr/>
                          <a href="#" onClick={toggleNewToken}
                             className="stretched-link grey-text white-hover">Token farm</a>
                        </MDBCardBody>
                      </MDBCard>
                    </MDBLink>
                  </MDBCol> <
                  MDBCol className="col-12 col-md-6 col-lg-4">
                  <MDBCard className="p-md-3 m-md-3 stylish-color-dark">
                    <MDBCardBody className="text-center white-text">
                      <MDBIcon icon="tools" size="4x"/>
                      <hr/>
                      <MDBBox style={{fontSize: 12}} className="grey-text">Function <br/>Custom</MDBBox>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
                </MDBRow>
              </MDBModalBody>
            </MDBModal>


            {/* --------------------------------------------------------------------------------------------------- */}
            {/* --------------------------------------- Add council member ---------------------------------------- */}
            {/* --------------------------------------------------------------------------------------------------- */}
            <MDBModal isOpen={newProposalCouncilMember} toggle={toggleNewCouncilMember} centered position="center"
                      size="lg">
              <MDBModalHeader className="text-center stylish-color white-text border-dark"
                              titleClass="w-100 font-weight-bold"
                              toggle={toggleNewCouncilMember}>
                Add Council Member
              </MDBModalHeader>
              <form className="needs-validation mx-3 grey-text"
                    name="newProposalCouncilMember"
                    noValidate
                    method="post"
                    onSubmit={submitProposal}
              >
                <MDBModalBody>
                  <MDBInput disabled={disableTarget} name="proposalTarget" value={proposalTarget.value}
                            onChange={changeHandler} label="Enter account"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTarget.message}
                    </div>
                  </MDBInput>
                  <MDBInput name="proposalDescription" value={proposalDescription.value} onChange={changeHandler}
                            required label="Enter description" group>
                    <div className="invalid-feedback">
                      {proposalDescription.message}
                    </div>
                  </MDBInput>
                  {daoPolicy ?
                    <MDBAlert color="warning">
                      You will pay a deposit of <span
                      style={{fontSize: 13}}>Ⓝ</span>{(new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear).toFixed(2))} to
                      add this proposal!
                    </MDBAlert>
                    : null}
                  <MDBBox className="text-muted font-small ml-2">*the deposit will be refunded if proposal rejected or
                    expired.</MDBBox>
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                  <MDBBtn color="elegant" type="submit">
                    Submit
                    {showSpinner ?
                      <div className="spinner-border spinner-border-sm ml-2" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      : null}
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModal>


            {/* --------------------------------------------------------------------------------------------------- */}
            {/* --------------------------------------- Add payout ------------------------------------------------ */}
            {/* --------------------------------------------------------------------------------------------------- */}
            <MDBModal isOpen={newProposalPayout} toggle={toggleNewPayout} centered position="center"
                      size="lg">
              <MDBModalHeader className="text-center stylish-color white-text border-dark"
                              titleClass="w-100 font-weight-bold"
                              toggle={toggleNewPayout}>
                Add Payout
              </MDBModalHeader>
              <form className="needs-validation mx-3 grey-text"
                    name="newProposalPayout"
                    noValidate
                    method="post"
                    onSubmit={submitProposal}
              >
                <MDBModalBody>
                  <MDBInput disabled={disableTarget} name="proposalTarget" value={proposalTarget.value}
                            onChange={changeHandler} label="Enter receiver account"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTarget.message}
                    </div>
                  </MDBInput>
                  <MDBInput name="proposalDescription" value={proposalDescription.value} onChange={changeHandler}
                            required label="Enter description" group>
                    <div className="invalid-feedback">
                      {proposalDescription.message}
                    </div>
                  </MDBInput>
                  <MDBInput value={proposalAmount.value} name="proposalAmount" onChange={changeHandler} required
                            label="Payout in NEAR" group>
                    <div className="invalid-feedback">
                      {proposalAmount.message}
                    </div>
                  </MDBInput>
                  {daoPolicy ?
                    <MDBAlert color="warning">
                      You will pay a deposit of <span
                      style={{fontSize: 13}}>Ⓝ</span>{(new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear).toFixed(2))} to
                      add this proposal!
                    </MDBAlert>
                    : null}
                  <MDBBox className="text-muted font-small ml-2">*the deposit will be refunded if proposal rejected or
                    expired.</MDBBox>
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                  <MDBBtn color="elegant" type="submit">
                    Submit
                    {showSpinner ?
                      <div className="spinner-border spinner-border-sm ml-2" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      : null}
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModal>

            {/* --------------------------------------------------------------------------------------------------- */}
            {/* --------------------------------------- Token Farm ------------------------------------------------ */}
            {/* --------------------------------------------------------------------------------------------------- */}
            <MDBModal isOpen={newProposalToken} toggle={toggleNewToken} centered position="center"
                      size="lg">
              <MDBModalHeader className="text-center stylish-color white-text border-dark"
                              titleClass="w-100 font-weight-bold"
                              toggle={toggleNewToken}>
                Create a new Token
              </MDBModalHeader>
              <form className="needs-validation mx-3 grey-text"
                    name="newProposalToken"
                    noValidate
                    method="post"
                    onSubmit={submitProposal}
              >
                <MDBModalBody>
                  <MDBInput disabled={disableTarget} name="proposalTokenOwner" value={proposalTokenOwner.value}
                            onChange={changeHandler} label="Enter owner account"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenOwner.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTokenSupply" value={proposalTokenSupply.value}
                            onChange={changeHandler} label="Total Supply"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenSupply.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTokenName" value={proposalTokenName.value}
                            onChange={changeHandler} label="Token Name"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenName.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTokenSymbol" value={proposalTokenSymbol.value}
                            onChange={changeHandler} label="Token Symbol"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenSymbol.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTokenIcon" value={proposalTokenIcon.value}
                            onChange={changeHandler} label="Token Icon URL"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenIcon.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTokenDecimals" value={proposalTokenDecimals.value}
                            onChange={changeHandler} label="Token Decimals"
                            required group>
                    <div className="invalid-feedback">
                      {proposalTokenDecimals.message}
                    </div>
                  </MDBInput>
                  <MDBInput disabled={disableTarget} name="proposalTarget" value={proposalTarget.value}
                            onChange={changeHandler} label="Enter receiver account"
                            group>
                    <div className="invalid-feedback">
                      {proposalTarget.message}
                    </div>
                  </MDBInput>
                  <MDBInput name="proposalDescription" value={proposalDescription.value} onChange={changeHandler}
                            required label="Enter description" group>
                    <div className="invalid-feedback">
                      {proposalDescription.message}
                    </div>
                  </MDBInput>
                  {daoPolicy ?
                    <>
                    <MDBAlert color="warning">
                      You will pay a deposit of <span
                      style={{fontSize: 13}}>Ⓝ</span>{(new Decimal(daoPolicy.proposal_bond.toString()).div(yoktoNear).toFixed(2))} to
                      add this proposal!
                    </MDBAlert>
                    <MDBAlert color="warning">
                      Please make sure DAO has at least <span
                      style={{fontSize: 13}}>Ⓝ</span>5 (for deposit) at the time of approval!
                    </MDBAlert>
                    </>
                    : null}
                  <MDBBox className="text-muted font-small ml-2">*the deposit will be refunded if proposal rejected or
                    expired.</MDBBox>
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                  <MDBBtn color="elegant" type="submit">
                    Submit
                    {showSpinner ?
                      <div className="spinner-border spinner-border-sm ml-2" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      : null}
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModal>


          </>
          : null}
        {selectDao ?
          <Selector setShowError={setShowError} setSelectDao={setSelectDao}/>
          : null
        }
        {showLoading && !selectDao ? <Loading/> : null}
      </MDBContainer>
      <Footer/>
    </MDBView>

  )
}

export default Dao;