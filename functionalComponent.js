//  Copyright (c) 2003-2020 Xsens Technologies B.V. or subsidiaries worldwide.
//  All rights reserved.
//  
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  
//  1.      Redistributions of source code must retain the above copyright notice,
//           this list of conditions, and the following disclaimer.
//  
//  2.      Redistributions in binary form must reproduce the above copyright notice,
//           this list of conditions, and the following disclaimer in the documentation
//           and/or other materials provided with the distribution.
//  
//  3.      Neither the names of the copyright holders nor the names of their contributors
//           may be used to endorse or promote products derived from this software without
//           specific prior written permission.
//  
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
//  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
//  THE COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
//  OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
//  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY OR
//  TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
//  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.THE LAWS OF THE NETHERLANDS 
//  SHALL BE EXCLUSIVELY APPLICABLE AND ANY DISPUTES SHALL BE FINALLY SETTLED UNDER THE RULES 
//  OF ARBITRATION OF THE INTERNATIONAL CHAMBER OF COMMERCE IN THE HAGUE BY ONE OR MORE 
//  ARBITRATORS APPOINTED IN ACCORDANCE WITH SAID RULES.
//  

// =======================================================================================
// Functional Component Class.
// Documentation: documentation/Xsens DOT Server - Functional Component Class.pdf
// =======================================================================================

class FunctionalComponent 
{
    constructor(name, transitions, choicePoints) 
    {
        this.name               = name;
        this.stateMachineTable  = {};
        this.choicePoints       = {};

        if( transitions != undefined && transitions.length > 0)
        {
            this.stateMachineTable = processStateTransitionsTable(transitions);
            this.currentState = transitions[0].stateName;
        }

        if (choicePoints != undefined && choicePoints.length > 0)
        {
            this.choicePoints = processChoicePointsTable(choicePoints);
        }
    }

    eventHandler( eventName, parameters )
    {
        
        ///console.log( "state: " + this.currentState + ", event: " + eventName );

        var entryString = this.currentState + '-' + eventName;
        var transition  = this.stateMachineTable[entryString];
        if( transition == undefined ) 
        {
            console.log
            ( 
                "ERROR: component '" + this.name + "' " +
                "received unexpected event '" + eventName + "' " +
                "in state '" + this.currentState + "'"
            );
            return;
        }

        if( transition.transFunc == undefined)
        {
            console.log
            (
                "ERROR: component '" + this.name + "' " +
                "has undefined transition function for event '" + eventName + "' " +
                "in state '" + this.currentState + "'"
            );
            return;
        }

        transition.transFunc( this, parameters );

        var previousState = this.currentState;
        this.currentState = transition.nextState;

        if( this.currentState.charAt(this.currentState.length-1) != '?' ) return;

        var choicePoint = this.choicePoints[ this.currentState ];
        if( choicePoint == undefined )
        {
            console.log
            (
                "ERROR: component '" + this.name + "'  " +
                "unknown choice-point '" + this.currentState + "'"
            );
            this.currentState = previousState;
            return;
        }

        if( choicePoint(this) )
        {
            this.eventHandler('yes')
        }
        else
        {
            this.eventHandler('no' );
        }
    }
}

// =======================================================================================
// Local functions
// =======================================================================================

// ---------------------------------------------------------------------------------------
// -- Process state transitions table --
// ---------------------------------------------------------------------------------------
function processStateTransitionsTable( stateTransitionsTable )
{
    var stateMachineTable = {};

    var entryString, transition;
    for( var i=0; i < stateTransitionsTable.length; i++ )
    {
        transition = stateTransitionsTable[i];

        entryString = transition.stateName + '-' + transition.eventName;
        if( stateMachineTable[ entryString ] != undefined )
        {
            console.log( "ERROR: transition for event '" + transition.eventName  + "' " +
                         "in state '" + transition.stateName + "' " + 
                         "already defined!" );
            continue;
        }
        stateMachineTable[ entryString ] = transition;
    };

    return stateMachineTable;
}

// ---------------------------------------------------------------------------------------
// -- Process choice-points table --
// ---------------------------------------------------------------------------------------
function processChoicePointsTable( choicePointsTable )
{
    var choicePoints = {};
    choicePointsTable.forEach( function(choicePoint)
    {
        choicePoints[choicePoint.name] = choicePoint.evalFunc;
    });
    return choicePoints;
}

// =======================================================================================
// Export the FunctionalComponent class
// =======================================================================================
module.exports = FunctionalComponent;