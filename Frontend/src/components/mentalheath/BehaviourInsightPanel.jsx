import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faBookOpen, faMouse, faRobot } from "@fortawesome/free-solid-svg-icons";

/* CONDITIONS */

const CONDITIONS = [

    {
        key: "adhd",
        label: "ADHD",
        icon: faBullseye,
        color: "#3b82f6",
        threshold: .52
    },

    {
        key: "dyslexia",
        label: "Dyslexia",
        icon: faBookOpen,
        color: "#22c55e",
        threshold: .46
    },

    {
        key: "motor",
        label: "Motor",
        icon: faMouse,
        color: "#ef4444",
        threshold: .44
    }

];


/* CARD */

function Card({ condition, data = {}, latched = {} }) {

    const [open, setOpen] = useState(false)

    /* SAFE ACCESS */

    const prob = data?.probability ?? 0

    const detected =

        (latched?.[condition.key] ?? false)

        ||

        (prob >= condition.threshold)


    return (

        <div
            style={{
                background: "#fff",
                padding: 18,
                borderRadius: 14,
                boxShadow: "0 3px 12px rgba(0,0,0,.05)"
            }}

        >

            <h4>

                {condition.icon && <FontAwesomeIcon icon={condition.icon} style={{ marginRight: 6 }} />}

                {" "}

                {condition.label}

            </h4>


            <p style={{ fontSize: 12 }}>

                Probability :

                <b>

                    {" "}

                    {Math.round(prob * 100)}%

                </b>

            </p>


            <p

                style={{

                    color: detected ?

                        condition.color

                        :

                        "#888",

                    fontWeight: 700

                }}

            >

                {detected ?

                    "Assistance Active ✓"

                    :

                    "Monitoring..."

                }

            </p>


            <button

                onClick={() => setOpen(!open)}

                style={{

                    marginTop: 8,

                    fontSize: 12,

                    color: condition.color,

                    fontWeight: 700

                }}

            >

                {open ?

                    "Hide"

                    :

                    "Show"

                }

                details

            </button>


            {open && (

                <div style={{ fontSize: 12, marginTop: 8 }}>

                    Signals analysing safely.

                </div>

            )}

        </div>

    )

}


/* MAIN PANEL */

export default function BehaviourInsightPanel({

    scores,

    latched

}) {

    /* HARD SAFETY */

    const safeScores =

        scores ??

        {}

    const safeLatched =

        latched ??

        {}


    /* READY CHECK */

    const ready =

        Object.keys(safeScores).length > 0


    return (

        <div>

            <h3>

                <FontAwesomeIcon icon={faRobot} style={{ marginRight: 6 }} /> AI Disability Detection

            </h3>


            {!ready ?

                (

                    <p style={{ color: "#888" }}>

                        AI warming up...

                    </p>

                )

                :

                (

                    <div

                        style={{

                            display: "grid",

                            gap: 12

                        }}

                    >

                        {

                            CONDITIONS.map(c => (

                                <Card

                                    key={c.key}

                                    condition={c}

                                    /* SAFE ACCESS */

                                    data={safeScores?.[c.key] ?? {}}

                                    latched={safeLatched}

                                />

                            ))

                        }

                    </div>

                )

            }

        </div>

    )

}